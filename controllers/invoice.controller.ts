import { Response } from 'express';
import { snap } from '../utils/midtrans';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Prisma } from '../generated/prisma/client';

export const payInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Fix 1: cast id agar tidak string | string[] | undefined
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

        // Fix 2: cast email ke string agar tidak conflict dengan exactOptionalPropertyTypes
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

        // Fix 3: bangun where clause secara eksplisit agar userId undefined tidak masuk ke Prisma where
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