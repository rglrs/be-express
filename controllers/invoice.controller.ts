import { Request, Response } from 'express';
import crypto from 'crypto';
import { snap } from '../utils/midtrans';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Prisma } from '../generated/prisma/client';

export const payInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                student: {
                    include: { user: true }
                }
            }
        });

        if (!invoice) {
            res.status(404).json({ status: "error", message: "Invoice not found" });
            return;
        }

        const invoiceWithRelations = invoice as any;

        if (req.user?.role !== 'ADMIN' && invoiceWithRelations.student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden: You do not own this invoice" });
            return;
        }

        if (invoice.status === 'PAID') {
            res.status(400).json({ status: "error", message: "Invoice is already paid" });
            return;
        }

        const orderId = `${invoice.id}-${Date.now()}`;
        const email = invoiceWithRelations.student.user.email as string;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: invoice.nominal
            },
            customer_details: {
                first_name: invoiceWithRelations.student.nama_lengkap,
                email
            }
        };

        const transaction = await snap.createTransaction(parameter);

        await prisma.transaction.create({
            data: {
                invoice_id: invoice.id,
                order_id_midtrans: orderId ?? null,
                snap_token: transaction.token ?? null
            }
        });

        res.json({ status: "success", data: { token: transaction.token } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const payPaket = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paket } = req.body;
        const userId = req.user?.id;

        const student = await prisma.student.findUnique({
            where: { user_id: userId ?? '' },
            include: { user: true }
        });

        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        let nominal = 0;
        let judul = '';

        if (paket === 'SEMESTER') {
            nominal = 1500000;
            judul = 'Paket Pelunasan SPP 1 Semester';
        } else if (paket === 'TAHUN') {
            nominal = 3000000;
            judul = 'Paket Pelunasan SPP 1 Tahun';
        } else if (paket === 'LULUS') {
            nominal = 9000000;
            judul = 'Paket Pelunasan SPP Sampai Lulus';
        } else {
            res.status(400).json({ status: "error", message: "Invalid package type" });
            return;
        }

        const invoice = await prisma.invoice.create({
            data: {
                student_id: student.id,
                judul_tagihan: judul,
                jenis_tagihan: 'SPP',
                nominal: nominal,
                tahun: new Date().getFullYear(),
                status: 'PENDING'
            }
        });

        const orderId = `${invoice.id}-${Date.now()}`;
        const email = student.user.email as string;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: invoice.nominal
            },
            customer_details: {
                first_name: student.nama_lengkap,
                email
            }
        };

        const transaction = await snap.createTransaction(parameter);

        await prisma.transaction.create({
            data: {
                invoice_id: invoice.id,
                order_id_midtrans: orderId,
                snap_token: transaction.token ?? null
            }
        });

        res.json({ status: "success", data: { token: transaction.token } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getAllInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';

        const where: Prisma.InvoiceWhereInput = isAdmin
            ? {}
            : { student: { user_id: userId ?? '' } };

        const invoices = await prisma.invoice.findMany({
            where,
            include: { student: true, transactions: true }
        });

        res.json({ status: "success", data: invoices });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { student_id, judul_tagihan, jenis_tagihan, bulan, nominal, tahun } = req.body;

        const invoice = await prisma.invoice.create({
            data: {
                student_id,
                judul_tagihan,
                jenis_tagihan: jenis_tagihan || 'LAINNYA',
                bulan: bulan ?? null,
                nominal: parseInt(nominal),
                tahun: parseInt(tahun) || new Date().getFullYear(),
                status: 'PENDING'
            }
        });

        res.status(201).json({ status: "success", data: invoice });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createMassInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { targetKelas, judul_tagihan, jenis_tagihan, bulan, nominal, tahun } = req.body;

        const whereClause = targetKelas === 'Semua' ? {} : { kelas: { startsWith: targetKelas as string } };
        const students = await prisma.student.findMany({ where: whereClause });

        if (students.length === 0) {
            res.status(404).json({ status: "error", message: "Tidak ada siswa di kelas tersebut" });
            return;
        }

        const invoiceData = students.map(student => ({
            student_id: student.id,
            judul_tagihan: judul_tagihan as string,
            jenis_tagihan: jenis_tagihan || 'LAINNYA',
            bulan: bulan ?? null,
            nominal: parseInt(nominal),
            tahun: parseInt(tahun) || new Date().getFullYear(),
            status: 'PENDING' as const
        }));

        await prisma.invoice.createMany({
            data: invoiceData
        });

        res.status(201).json({ status: "success", message: `Berhasil membuat ${invoiceData.length} tagihan` });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const midtransCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order_id, status_code, gross_amount, signature_key, transaction_status } = req.body;
        
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

        const hashed = crypto.createHash('sha512').update(order_id + status_code + gross_amount + serverKey).digest('hex');

        if (hashed !== signature_key) {
            res.status(400).json({ status: "error", message: "Invalid signature" });
            return;
        }

        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            const transaction = await prisma.transaction.findFirst({
                where: { order_id_midtrans: order_id as string }
            });

            if (transaction) {
                await prisma.invoice.update({
                    where: { id: transaction.invoice_id },
                    data: { status: 'PAID', tanggal_lunas: new Date() }
                });
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'SUCCESS' }
                });
            }
        }

        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                student: {
                    include: { user: { select: { email: true } } }
                },
                transactions: true,
                email_logs: true
            }
        });

        if (!invoice) {
            res.status(404).json({ status: "error", message: "Invoice not found" });
            return;
        }

        const invoiceWithRelations = invoice as any;

        if (req.user?.role !== 'ADMIN' && invoiceWithRelations.student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden: You don't have access to this invoice" });
            return;
        }

        res.status(200).json({
            status: "success",
            data: invoice
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getInvoicesByStudent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const student_id = req.params.student_id as string;
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;

        const skip = (page - 1) * limit;

        const student = await prisma.student.findUnique({
            where: { id: student_id }
        });

        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where: { student_id: student_id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { transactions: true }
            }),
            prisma.invoice.count({ where: { student_id: student_id } })
        ]);

        res.status(200).json({
            status: "success",
            data: invoices,
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

export const updateInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { judul_tagihan, nominal, tanggal_jatuh_tempo } = req.body;

        const invoice = await prisma.invoice.findUnique({ where: { id } });

        if (!invoice) {
            res.status(404).json({ status: "error", message: "Invoice not found" });
            return;
        }

        if (invoice.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: "Can only update invoices with PENDING status"
            });
            return;
        }

        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                judul_tagihan: judul_tagihan ?? invoice.judul_tagihan,
                nominal: nominal ? parseInt(nominal) : invoice.nominal,
                tanggal_jatuh_tempo: tanggal_jatuh_tempo ? new Date(tanggal_jatuh_tempo) : (invoice.tanggal_jatuh_tempo ?? null)
            }
        });

        res.status(200).json({
            status: "success",
            message: "Invoice updated successfully",
            data: updatedInvoice
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const deleteInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const invoice = await prisma.invoice.findUnique({ where: { id } });

        if (!invoice) {
            res.status(404).json({ status: "error", message: "Invoice not found" });
            return;
        }

        if (invoice.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: "Can only delete invoices with PENDING status"
            });
            return;
        }

        await prisma.invoice.delete({ where: { id } });

        res.status(200).json({
            status: "success",
            message: "Invoice deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getFinancialSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const month = typeof req.query.month === 'string' ? parseInt(req.query.month) : new Date().getMonth() + 1;
        const year = typeof req.query.year === 'string' ? parseInt(req.query.year) : new Date().getFullYear();

        const [totalInvoices, paidInvoices, overdueInvoices, pendingInvoices] = await Promise.all([
            prisma.invoice.aggregate({
                where: { tahun: year, bulan: month.toString() },
                _sum: { nominal: true }
            }),
            prisma.invoice.aggregate({
                where: { status: 'PAID', tahun: year, bulan: month.toString() },
                _sum: { nominal: true }
            }),
            prisma.invoice.aggregate({
                where: { status: 'OVERDUE', tahun: year, bulan: month.toString() },
                _sum: { nominal: true }
            }),
            prisma.invoice.aggregate({
                where: { status: 'PENDING', tahun: year, bulan: month.toString() },
                _sum: { nominal: true }
            })
        ]);

        res.status(200).json({
            status: "success",
            data: {
                month,
                year,
                total_tagihan: totalInvoices._sum.nominal || 0,
                total_terbayar: paidInvoices._sum.nominal || 0,
                total_overdue: overdueInvoices._sum.nominal || 0,
                total_pending: pendingInvoices._sum.nominal || 0
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const payInvoiceManual = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.id;
        const { bukti_transfer_url } = req.body;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { student: true }
        });

        if (!invoice) {
            res.status(404).json({ status: "error", message: "Invoice not found" });
            return;
        }

        const invoiceWithRelations = invoice as any;

        if (req.user?.role !== 'ADMIN' && invoiceWithRelations.student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden" });
            return;
        }

        if (invoice.status === 'PAID') {
            res.status(400).json({ status: "error", message: "Invoice is already paid" });
            return;
        }

        await prisma.transaction.create({
            data: {
                invoice_id: id,
                metode_bayar: 'MANUAL',
                jumlah_bayar: invoice.nominal,
                bukti_transfer_url: bukti_transfer_url ?? null,
                status: 'PENDING'
            }
        });

        res.json({ status: "success", message: "Bukti transfer berhasil diunggah." });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getPendingManualTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                metode_bayar: 'MANUAL',
                status: 'PENDING'
            },
            include: {
                invoice: {
                    include: { student: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ status: "success", data: transactions });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const verifyManualTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { action } = req.body; 
        const adminId = req.user?.id;

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { invoice: true }
        });

        if (!transaction || transaction.metode_bayar !== 'MANUAL') {
            res.status(404).json({ status: "error", message: "Transaction not found" });
            return;
        }

        if (action === 'accept') {
            await prisma.$transaction(async (tx) => {
                await tx.transaction.update({
                    where: { id },
                    data: { status: 'SUCCESS', verified_at: new Date(), verified_by: adminId ?? null }
                });
                await tx.invoice.update({
                    where: { id: transaction.invoice_id },
                    data: { status: 'PAID', tanggal_lunas: new Date() }
                });
            });
            res.json({ status: "success", message: "Pembayaran diverifikasi." });
        } else {
            await prisma.transaction.update({
                where: { id },
                data: { status: 'FAILED', verified_at: new Date(), verified_by: adminId ?? null }
            });
            res.json({ status: "success", message: "Pembayaran ditolak." });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};