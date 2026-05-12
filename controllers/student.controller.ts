import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const search = typeof req.query.search === 'string' ? req.query.search : "";
        const kelas = typeof req.query.kelas === 'string' ? req.query.kelas : undefined;
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { nama_lengkap: { contains: search, mode: 'insensitive' } },
                { nisn: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (kelas) where.kelas = kelas;
        if (status) where.status = status;

        const students = await prisma.student.findMany({
            skip,
            take: limit,
            where,
            include: { user: { select: { email: true, role: true } }, orang_tua: true, invoices: true }
        });

        const totalData = await prisma.student.count({ where });

        res.status(200).json({
            status: "success",
            data: students,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: totalData,
                total_pages: Math.ceil(totalData / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const student = await prisma.student.findUnique({
            where: { id: String(id) },
            include: {
                user: { select: { email: true, role: true } },
                orang_tua: true,
                invoices: true,
                registration: true
            }
        });

        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        if (req.user?.role === 'STUDENT' && student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden: You don't have access to this student data" });
            return;
        }

        res.status(200).json({ status: "success", data: student });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { 
            nisn, nama_lengkap, kelas, jurusan, angkatan, 
            email, no_hp, alamat, nama_ortu, no_hp_ortu,
            email_orang_tua, email_ortu
        } = req.body;
        
        const parentEmail = email_orang_tua !== undefined ? email_orang_tua : email_ortu;

        const currentStudent = await prisma.student.findUnique({
            where: { id: String(id) },
            include: { orang_tua: true }
        });

        if (!currentStudent) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        if (email) {
            await prisma.user.update({
                where: { id: currentStudent.user_id },
                data: { email: email }
            });
        }

        let orangTuaId = currentStudent.orang_tua_id;
        
        if (nama_ortu !== undefined || no_hp_ortu !== undefined || parentEmail !== undefined) {
            if (orangTuaId) {
                await prisma.orangTua.update({
                    where: { id: orangTuaId },
                    data: {
                        nama_lengkap: nama_ortu !== undefined ? nama_ortu : currentStudent.orang_tua?.nama_lengkap,
                        no_hp: no_hp_ortu !== undefined ? no_hp_ortu : currentStudent.orang_tua?.no_hp,
                        email: parentEmail !== undefined ? parentEmail : currentStudent.orang_tua?.email
                    }
                });
            } else if (nama_ortu) {
                const newOrangTua = await prisma.orangTua.create({
                    data: {
                        nama_lengkap: nama_ortu,
                        no_hp: no_hp_ortu || null,
                        email: parentEmail || null
                    }
                });
                orangTuaId = newOrangTua.id;
            }
        }

        const updatedStudent = await prisma.student.update({
            where: { id: String(id) },
            data: {
                nisn: nisn ?? undefined,
                nama_lengkap: nama_lengkap ?? undefined,
                kelas: kelas ?? undefined,
                jurusan: jurusan ?? undefined,
                angkatan: angkatan ?? undefined,
                no_hp: no_hp ?? undefined,
                alamat: alamat ?? undefined,
                email_orang_tua: parentEmail ?? undefined,
                orang_tua_id: orangTuaId
            },
            include: {
                user: { select: { email: true, role: true } },
                orang_tua: true
            }
        });

        res.status(200).json({ status: "success", message: "Student updated successfully", data: updatedStudent });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.student.delete({
            where: { id: String(id) }
        });
        res.status(200).json({ status: "success", message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: { user_id: userId! },
            include: { invoices: true }
        });

        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        const [
            totalInvoices,
            paidInvoices,
            pendingInvoices,
            overdueInvoices,
            totalTagihan,
            totalTerbayar,
            totalTunggakan
        ] = await Promise.all([
            prisma.invoice.count({ where: { student_id: student.id } }),
            prisma.invoice.count({ where: { student_id: student.id, status: 'PAID' } }),
            prisma.invoice.count({ where: { student_id: student.id, status: 'PENDING' } }),
            prisma.invoice.count({ where: { student_id: student.id, status: 'OVERDUE' } }),
            prisma.invoice.aggregate({
                where: { student_id: student.id },
                _sum: { nominal: true }
            }),
            prisma.invoice.aggregate({
                where: { student_id: student.id, status: 'PAID' },
                _sum: { nominal: true }
            }),
            prisma.invoice.aggregate({
                where: { student_id: student.id, status: { in: ['PENDING', 'OVERDUE'] } },
                _sum: { nominal: true }
            })
        ]);

        res.status(200).json({
            status: "success",
            data: {
                student_info: {
                    id: student.id,
                    nama: student.nama_lengkap,
                    nisn: student.nisn,
                    kelas: student.kelas,
                    jurusan: student.jurusan,
                    status: student.status,
                    blokir_ujian: student.blokir_ujian,
                    is_beasiswa: student.is_beasiswa
                },
                finansial: {
                    total_invoices: totalInvoices,
                    paid_invoices: paidInvoices,
                    pending_invoices: pendingInvoices,
                    overdue_invoices: overdueInvoices,
                    total_nominal: totalTagihan._sum.nominal || 0,
                    total_paid: totalTerbayar._sum.nominal || 0,
                    total_unpaid: totalTunggakan._sum.nominal || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getStudentInvoiceSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: { user_id: userId! }
        });

        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        const invoices = await prisma.invoice.findMany({
            where: { student_id: student.id },
            orderBy: { createdAt: 'desc' }
        });

        const summary = {
            total_invoices: invoices.length,
            by_status: {
                pending: invoices.filter(i => i.status === 'PENDING').length,
                paid: invoices.filter(i => i.status === 'PAID').length,
                overdue: invoices.filter(i => i.status === 'OVERDUE').length
            },
            by_type: {
                spp: invoices.filter(i => i.jenis_tagihan === 'SPP').length,
                du: invoices.filter(i => i.jenis_tagihan === 'DU').length,
                buku: invoices.filter(i => i.jenis_tagihan === 'BUKU').length,
                seragam: invoices.filter(i => i.jenis_tagihan === 'SERAGAM').length,
                lainnya: invoices.filter(i => i.jenis_tagihan === 'LAINNYA').length
            }
        };

        res.status(200).json({
            status: "success",
            data: { invoices, summary }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};