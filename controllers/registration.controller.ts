import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';

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
            status: "success",
            data: registrations,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
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
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }

        res.status(200).json({
            status: "success",
            data: registration
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const acceptRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { password } = req.body;
        const admin_id = req.user?.id as string;

        if (!password) {
            res.status(400).json({ status: "error", message: "Password is required" });
            return;
        }

        const registration = await prisma.registration.findUnique({ where: { id } });

        if (!registration) {
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }

        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: `Cannot accept registration with status: ${registration.status}`
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: registration.email,
                    password_hash: hashedPassword,
                    role: 'STUDENT'
                }
            });

            const student = await tx.student.create({
                data: {
                    user_id: user.id,
                    nisn: registration.nisn,
                    nama_lengkap: registration.nama_lengkap,
                    jurusan: registration.jurusan,
                    no_hp: registration.no_hp ?? null,
                    hp_orang_tua: registration.hp_orang_tua ?? null,
                    alamat: registration.alamat ?? null,
                    kelas: '10'
                }
            });

            const updatedRegistration = await tx.registration.update({
                where: { id },
                data: {
                    status: 'ACCEPTED',
                    student_id: student.id
                }
            });

            return { user, student, updatedRegistration };
        });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'accept',
                entity_type: 'registration',
                entity_id: id,
                deskripsi: `Accept registration untuk ${registration.nama_lengkap}`,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Registration accepted successfully",
            data: result.updatedRegistration
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({
                status: "error",
                message: "Email or NISN already registered"
            });
        } else {
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
};

export const rejectRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { alasan } = req.body;
        const admin_id = req.user?.id as string;

        if (!alasan) {
            res.status(400).json({ status: "error", message: "Rejection reason is required" });
            return;
        }

        const registration = await prisma.registration.findUnique({ where: { id } });

        if (!registration) {
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }

        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: `Cannot reject registration with status: ${registration.status}`
            });
            return;
        }

        const updatedRegistration = await prisma.registration.update({
            where: { id },
            data: {
                status: 'REJECTED',
                catatan_admin: alasan
            }
        });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'reject',
                entity_type: 'registration',
                entity_id: id,
                deskripsi: `Reject registration untuk ${registration.nama_lengkap}: ${alasan}`,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Registration rejected successfully",
            data: updatedRegistration
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            nama_lengkap,
            nisn,
            email,
            jurusan,
            nama_orang_tua,
            hp_orang_tua,
            berkas_url,
            no_hp,
            alamat
        } = req.body;

        if (!nama_lengkap || !nisn || !email || !jurusan) {
            res.status(400).json({
                status: "error",
                message: "nama_lengkap, nisn, email, and jurusan are required"
            });
            return;
        }

        const existingRegistration = await prisma.registration.findFirst({
            where: {
                OR: [
                    { nisn },
                    { email }
                ]
            }
        });

        if (existingRegistration) {
            res.status(400).json({
                status: "error",
                message: "NISN or email already registered"
            });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({
                status: "error",
                message: "Email already in use"
            });
            return;
        }

        const registration = await prisma.registration.create({
            data: {
                nama_lengkap,
                nisn,
                email,
                jurusan,
                no_hp: no_hp || null,
                alamat: alamat || null,
                nama_orang_tua: nama_orang_tua || "",
                hp_orang_tua: hp_orang_tua || null,
                berkas_url: Array.isArray(berkas_url) ? berkas_url : [],
                status: 'PENDING'
            }
        });

        res.status(201).json({
            status: "success",
            message: "Registration submitted successfully",
            data: registration
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
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
            berkas_url,
            no_hp,
            alamat
        } = req.body;

        const registration = await prisma.registration.findUnique({ where: { id } });

        if (!registration) {
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }

        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: `Cannot update registration with status: ${registration.status}`
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
                no_hp: no_hp ?? registration.no_hp,
                alamat: alamat ?? registration.alamat,
                berkas_url: berkas_url ? (Array.isArray(berkas_url) ? berkas_url : registration.berkas_url) : registration.berkas_url
            }
        });

        res.status(200).json({
            status: "success",
            message: "Registration updated successfully",
            data: updatedRegistration
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const checkRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nisn, email } = req.query;

        if (!nisn || !email) {
            res.status(400).json({ status: "error", message: "NISN dan Email wajib diisi" });
            return;
        }

        const registration = await prisma.registration.findFirst({
            where: {
                nisn: nisn as string,
                email: email as string
            }
        });

        if (!registration) {
            res.status(404).json({ status: "error", message: "Data pendaftaran tidak ditemukan" });
            return;
        }

        res.status(200).json({
            status: "success",
            data: registration
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};