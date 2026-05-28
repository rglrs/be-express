import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';
import { kirimEmailPPDB } from './email.controller';

export const getAllRegistrations = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;

        const [registrations, total] = await Promise.all([
            prisma.registration.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: { id: true, user: { select: { email: true } } }
                    }
                }
            }),
            prisma.registration.count({ where })
        ]);

        res.status(200).json({
            status: "sukses",
            data: registrations,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({ status: "gagal", message: error.message || "Terjadi kesalahan pada server" });
    }
};

export const getRegistrationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const registration = await prisma.registration.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        user: { select: { email: true } },
                        nisn: true,
                        nama_lengkap: true
                    }
                }
            }
        });

        if (!registration) {
            res.status(404).json({ status: "gagal", message: "Data pendaftaran tidak ditemukan" });
            return;
        }

        res.status(200).json({
            status: "sukses",
            data: registration
        });
    } catch (error: any) {
        res.status(500).json({ status: "gagal", message: error.message || "Terjadi kesalahan pada server" });
    }
};

export const acceptRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const admin_id = req.user?.id || 'SYSTEM';

        const registration = await prisma.registration.findUnique({ where: { id } });

        if (!registration) {
            res.status(404).json({ status: "gagal", message: "Data pendaftaran tidak ditemukan" });
            return;
        }

        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "gagal",
                message: `Tidak dapat menerima pendaftaran dengan status: ${registration.status}`
            });
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: registration.email,
                    password_hash: registration.password || "",
                    role: 'STUDENT'
                }
            });

            const orangTua = await tx.orangTua.create({
                data: {
                    nama_lengkap: registration.nama_orang_tua || "Orang Tua",
                    no_hp: registration.hp_orang_tua || null,
                    email: registration.email_orang_tua || null
                }
            });

            const student = await tx.student.create({
                data: {
                    user_id: user.id,
                    nisn: registration.nisn,
                    nama_lengkap: registration.nama_lengkap,
                    jurusan: registration.jurusan,
                    no_hp: registration.no_hp ?? null,
                    alamat: registration.alamat ?? null,
                    email_beasiswa: registration.email_beasiswa ?? null,
                    email_orang_tua: registration.email_orang_tua ?? null,
                    kelas: '10',
                    orang_tua_id: orangTua.id
                }
            });

            const updatedRegistration = await tx.registration.update({
                where: { id },
                data: {
                    status: 'ACCEPTED',
                    student_id: student.id
                }
            });

            return { user, orangTua, student, updatedRegistration };
        });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'accept',
                entity_type: 'registration',
                entity_id: id,
                deskripsi: `Menerima pendaftaran untuk ${registration.nama_lengkap}`,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "sukses",
            message: "Pendaftaran berhasil diterima",
            data: result.updatedRegistration
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({
                status: "gagal",
                message: "Email atau NISN sudah terdaftar pada Data Master"
            });
        } else {
            res.status(500).json({ status: "gagal", message: error.message || "Terjadi kesalahan pada server" });
        }
    }
};

export const rejectRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { alasan } = req.body;
        const admin_id = req.user?.id || 'SYSTEM';

        if (!alasan) {
            res.status(400).json({ status: "gagal", message: "Alasan penolakan wajib diisi" });
            return;
        }

        const registration = await prisma.registration.findUnique({ where: { id } });

        if (!registration) {
            res.status(404).json({ status: "gagal", message: "Data pendaftaran tidak ditemukan" });
            return;
        }

        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "gagal",
                message: `Tidak dapat menolak pendaftaran dengan status: ${registration.status}`
            });
            return;
        }

        await prisma.registration.delete({
            where: { id }
        });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'reject_and_delete',
                entity_type: 'registration',
                entity_id: id,
                deskripsi: `Menolak dan menghapus pendaftaran untuk ${registration.nama_lengkap}. Alasan: ${alasan}`,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "sukses",
            message: "Pendaftaran ditolak dan data berhasil dihapus",
            data: registration
        });
    } catch (error: any) {
        res.status(500).json({ status: "gagal", message: error.message || "Terjadi kesalahan pada server" });
    }
};

export const createRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            nama_lengkap,
            nisn,
            email,
            email_beasiswa,
            password,
            jurusan,
            nama_orang_tua,
            hp_orang_tua,
            email_orang_tua,
            berkas_url,
            no_hp,
            alamat
        } = req.body;

        if (!nama_lengkap || !nisn || !email || !jurusan || !password) {
            res.status(400).json({
                status: "gagal",
                message: "nama_lengkap, nisn, email, password, dan jurusan wajib diisi"
            });
            return;
        }

        const existingRegistrations = await prisma.registration.findMany({
            where: {
                OR: [
                    { nisn },
                    { email }
                ]
            }
        });

        for (const reg of existingRegistrations) {
            if (reg.status === 'REJECTED') {
                await prisma.registration.delete({
                    where: { id: reg.id }
                });
            } else {
                res.status(400).json({
                    status: "gagal",
                    message: "NISN atau email sudah terdaftar dan sedang diproses atau sudah diterima."
                });
                return;
            }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({
                status: "gagal",
                message: "Email sudah terdaftar sebagai pengguna aktif."
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const registration = await prisma.registration.create({
            data: {
                nama_lengkap,
                nisn,
                email,
                email_beasiswa: email_beasiswa || null,
                password: hashedPassword,
                jurusan,
                no_hp: no_hp || null,
                alamat: alamat || null,
                nama_orang_tua: nama_orang_tua || "",
                hp_orang_tua: hp_orang_tua || null,
                email_orang_tua: email_orang_tua || null,
                berkas_url: Array.isArray(berkas_url) ? berkas_url : [],
                status: 'PENDING'
            }
        });

        await kirimEmailPPDB(email, nama_lengkap, password);

        res.status(201).json({
            status: "sukses",
            message: "Pendaftaran berhasil diajukan",
            data: registration
        });
    } catch (error: any) {
        res.status(500).json({ status: "gagal", message: error.message || "Terjadi kesalahan pada server" });
    }
};

export const updateRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const {
            nama_lengkap,
            jurusan,
            nama_orang_tua,
            hp_orang_tua,
            email_orang_tua,
            berkas_url,
            no_hp,
            alamat,
            email_beasiswa
        } = req.body;

        const registration = await prisma.registration.findUnique({ where: { id } });

        if (!registration) {
            res.status(404).json({ status: "gagal", message: "Data pendaftaran tidak ditemukan" });
            return;
        }

        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "gagal",
                message: `Tidak dapat memperbarui pendaftaran dengan status: ${registration.status}`
            });
            return;
        }

        const updatedRegistration = await prisma.registration.update({
            where: { id },
            data: {
                nama_lengkap: nama_lengkap ?? registration.nama_lengkap,
                jurusan: jurusan ?? registration.jurusan,
                nama_orang_tua: nama_orang_tua ?? registration.nama_orang_tua,
                hp_orang_tua: hp_orang_tua ?? registration.hp_orang_tua,
                email_orang_tua: email_orang_tua ?? registration.email_orang_tua,
                no_hp: no_hp ?? registration.no_hp,
                alamat: alamat ?? registration.alamat,
                email_beasiswa: email_beasiswa ?? registration.email_beasiswa,
                berkas_url: berkas_url ? (Array.isArray(berkas_url) ? berkas_url : registration.berkas_url) : registration.berkas_url
            }
        });

        res.status(200).json({
            status: "sukses",
            message: "Pendaftaran berhasil diperbarui",
            data: updatedRegistration
        });
    } catch (error: any) {
        res.status(500).json({ status: "gagal", message: error.message || "Terjadi kesalahan pada server" });
    }
};

export const checkRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nisn, email } = req.query;

        if (!nisn || !email) {
            res.status(400).json({ status: "gagal", message: "NISN dan Email wajib diisi" });
            return;
        }

        const registration = await prisma.registration.findFirst({
            where: {
                nisn: nisn as string,
                email: email as string
            }
        });

        if (!registration) {
            res.status(404).json({ status: "gagal", message: "Data pendaftaran tidak ditemukan" });
            return;
        }

        res.status(200).json({
            status: "sukses",
            data: registration
        });
    } catch (error: any) {
        res.status(500).json({ status: "gagal", message: error.message || "Terjadi kesalahan pada server" });
    }
};