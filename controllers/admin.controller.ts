import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const blockStudent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { student_id } = req.params as { student_id: string };
        const { alasan_blokir } = req.body;
        const admin_id = req.user?.id as string;

        const student = await prisma.student.findUnique({ where: { id: student_id } });
        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        const oldData = JSON.stringify({
            blokir_ujian: student.blokir_ujian,
            alasan_blokir: student.alasan_blokir,
            tanggal_blokir: student.tanggal_blokir
        });

        const updatedStudent = await prisma.student.update({
            where: { id: student_id },
            data: {
                blokir_ujian: true,
                alasan_blokir: alasan_blokir || null,
                tanggal_blokir: new Date()
            }
        });

        const newData = JSON.stringify({
            blokir_ujian: updatedStudent.blokir_ujian,
            alasan_blokir: updatedStudent.alasan_blokir,
            tanggal_blokir: updatedStudent.tanggal_blokir
        });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'block',
                entity_type: 'student',
                entity_id: student_id,
                student_id,
                deskripsi: `Block student dari ujian: ${alasan_blokir}`,
                perubahan_old: oldData,
                perubahan_new: newData,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Student blocked successfully",
            data: updatedStudent
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const unblockStudent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { student_id } = req.params as { student_id: string };
        const admin_id = req.user?.id as string;

        const student = await prisma.student.findUnique({ where: { id: student_id } });
        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        const oldData = JSON.stringify({
            blokir_ujian: student.blokir_ujian,
            alasan_blokir: student.alasan_blokir,
            tanggal_blokir: student.tanggal_blokir
        });

        const updatedStudent = await prisma.student.update({
            where: { id: student_id },
            data: {
                blokir_ujian: false,
                alasan_blokir: null,
                tanggal_blokir: null
            }
        });

        const newData = JSON.stringify({
            blokir_ujian: updatedStudent.blokir_ujian,
            alasan_blokir: updatedStudent.alasan_blokir,
            tanggal_blokir: updatedStudent.tanggal_blokir
        });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'unblock',
                entity_type: 'student',
                entity_id: student_id,
                student_id,
                deskripsi: 'Unblock student dari ujian',
                perubahan_old: oldData,
                perubahan_new: newData,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Student unblocked successfully",
            data: updatedStudent
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [
            totalStudents,
            totalInvoices,
            paidInvoices,
            overdueInvoices,
            totalRevenue,
            blockedStudents,
            registrationsPending,
            registrationsAccepted,
            registrationsRejected
        ] = await Promise.all([
            prisma.student.count(),
            prisma.invoice.count(),
            prisma.invoice.count({ where: { status: 'PAID' } }),
            prisma.invoice.count({ where: { status: 'OVERDUE' } }),
            prisma.invoice.aggregate({
                where: { status: 'PAID' },
                _sum: { nominal: true }
            }),
            prisma.student.count({ where: { blokir_ujian: true } }),
            prisma.registration.count({ where: { status: 'PENDING' } }),
            prisma.registration.count({ where: { status: 'ACCEPTED' } }),
            prisma.registration.count({ where: { status: 'REJECTED' } })
        ]);

        const totalTagihan = await prisma.invoice.aggregate({
            _sum: { nominal: true }
        });

        const tunggakan = await prisma.invoice.aggregate({
            where: { status: { in: ['PENDING', 'OVERDUE'] } },
            _sum: { nominal: true }
        });

        const currentYear = new Date().getFullYear();
        const paidInvoicesThisYear = await prisma.invoice.findMany({
            where: {
                status: 'PAID',
                tanggal_lunas: {
                    gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
                    lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
                }
            },
            select: { nominal: true, tanggal_lunas: true }
        });

        const monthly_revenue = Array(12).fill(0);
        paidInvoicesThisYear.forEach(inv => {
            if (inv.tanggal_lunas) {
                const month = inv.tanggal_lunas.getMonth();
                monthly_revenue[month] += inv.nominal;
            }
        });

        res.status(200).json({
            status: "success",
            data: {
                students: {
                    total: totalStudents,
                    blocked: blockedStudents
                },
                invoices: {
                    total: totalInvoices,
                    paid: paidInvoices,
                    overdue: overdueInvoices,
                    total_nominal: totalTagihan._sum.nominal || 0,
                    total_paid: totalRevenue._sum.nominal || 0,
                    total_unpaid: tunggakan._sum.nominal || 0,
                    monthly_revenue
                },
                registrations: {
                    pending: registrationsPending,
                    accepted: registrationsAccepted,
                    rejected: registrationsRejected
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const updateStudentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { student_id } = req.params as { student_id: string };
        const { status } = req.body;
        const admin_id = req.user?.id as string;

        const validStatuses = ['AKTIF', 'UNDUR_DIRI', 'KELUAR'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                status: "error",
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
            return;
        }

        const student = await prisma.student.findUnique({ where: { id: student_id } });
        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        const oldData = JSON.stringify({ status: student.status });

        const updatedStudent = await prisma.student.update({
            where: { id: student_id },
            data: { status }
        });

        const newData = JSON.stringify({ status: updatedStudent.status });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'update',
                entity_type: 'student',
                entity_id: student_id,
                student_id,
                deskripsi: `Update status: ${student.status} → ${status}`,
                perubahan_old: oldData,
                perubahan_new: newData,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Student status updated",
            data: updatedStudent
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const verifyTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { transaction_id } = req.params as { transaction_id: string };
        const admin_id = req.user?.id as string;

        const transaction = await prisma.transaction.findUnique({
            where: { id: transaction_id },
            include: { invoice: true }
        });

        if (!transaction) {
            res.status(404).json({ status: "error", message: "Transaction not found" });
            return;
        }

        if (transaction.status === 'SUCCESS') {
            res.status(400).json({ status: "error", message: "Transaction already verified" });
            return;
        }

        const oldData = JSON.stringify({ status: transaction.status });

        const updatedTransaction = await prisma.transaction.update({
            where: { id: transaction_id },
            data: {
                status: 'SUCCESS',
                verified_at: new Date(),
                verified_by: admin_id ?? null
            }
        });

        await prisma.invoice.update({
            where: { id: transaction.invoice_id },
            data: {
                status: 'PAID',
                tanggal_lunas: new Date()
            }
        });

        const newData = JSON.stringify({ status: updatedTransaction.status });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'verify',
                entity_type: 'transaction',
                entity_id: transaction_id,
                deskripsi: 'Verify manual transaction payment',
                perubahan_old: oldData,
                perubahan_new: newData,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Transaction verified successfully",
            data: updatedTransaction
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const rejectTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { transaction_id } = req.params as { transaction_id: string };
        const { alasan } = req.body;
        const admin_id = req.user?.id as string;

        const transaction = await prisma.transaction.findUnique({
            where: { id: transaction_id }
        });

        if (!transaction) {
            res.status(404).json({ status: "error", message: "Transaction not found" });
            return;
        }

        const oldData = JSON.stringify({ status: transaction.status });

        const updatedTransaction = await prisma.transaction.update({
            where: { id: transaction_id },
            data: {
                status: 'FAILED',
                verified_at: new Date(),
                verified_by: admin_id ?? null
            }
        });

        const newData = JSON.stringify({ status: updatedTransaction.status });

        await prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'reject',
                entity_type: 'transaction',
                entity_id: transaction_id,
                deskripsi: `Reject transaction: ${alasan}`,
                perubahan_old: oldData,
                perubahan_new: newData,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Transaction rejected",
            data: updatedTransaction
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};