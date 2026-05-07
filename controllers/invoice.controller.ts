import { Request, Response } from 'express';
import crypto from 'crypto';
import { snap } from '../utils/midtrans';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Prisma } from '../generated/prisma/client';

export const payInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params['id'] as string;
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

        if (req.user?.role !== 'ADMIN' && invoice.student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden: You do not own this invoice" });
            return;
        }

        if (invoice.status === 'PAID') {
            res.status(400).json({ status: "error", message: "Invoice is already paid" });
            return;
        }

        const orderId = `${invoice.id}-${Date.now()}`;
        const email = invoice.student.user.email as string;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: invoice.nominal
            },
            customer_details: {
                first_name: invoice.student.nama_lengkap,
                email
            }
        };

        const transaction = await snap.createTransaction(parameter);

        await prisma.transaction.create({
            data: {
                invoice_id: invoice.id,
                order_id_midtrans: orderId,
                snap_token: transaction.token
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
            include: { student: true }
        });

        res.json({ status: "success", data: invoices });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { student_id, judul_tagihan, bulan, nominal } = req.body;

        const invoice = await prisma.invoice.create({
            data: {
                student_id,
                judul_tagihan,
                bulan,
                nominal: parseInt(nominal),
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
        const { targetKelas, judul_tagihan, bulan, nominal } = req.body;

        const whereClause = targetKelas === 'Semua' ? {} : { kelas: { startsWith: targetKelas } };
        const students = await prisma.student.findMany({ where: whereClause });

        if (students.length === 0) {
            res.status(404).json({ status: "error", message: "Tidak ada siswa di kelas tersebut" });
            return;
        }

        const invoiceData = students.map(student => ({
            student_id: student.id,
            judul_tagihan,
            bulan,
            nominal: parseInt(nominal),
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
                where: { order_id_midtrans: order_id }
            });

            if (transaction) {
                await prisma.invoice.update({
                    where: { id: transaction.invoice_id },
                    data: { status: 'PAID' }
                });
            }
        }

        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};