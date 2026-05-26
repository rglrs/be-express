"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPayInvoice = exports.verifyManualTransaction = exports.getPendingManualTransactions = exports.payInvoiceManual = exports.getFinancialSummary = exports.deleteInvoice = exports.updateInvoice = exports.getInvoicesByStudent = exports.getInvoiceById = exports.midtransCallback = exports.createMassInvoice = exports.createInvoice = exports.getAllInvoices = exports.payPaket = exports.payInvoice = void 0;
const crypto_1 = __importDefault(require("crypto"));
const midtrans_1 = require("../utils/midtrans");
const prisma_1 = require("../utils/prisma");
const email_controller_1 = require("./email.controller");
const payInvoice = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const invoice = await prisma_1.prisma.invoice.findUnique({
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
        const invoiceWithRelations = invoice;
        if (req.user?.role !== 'ADMIN' && invoiceWithRelations.student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden: You do not own this invoice" });
            return;
        }
        if (invoice.status === 'PAID') {
            res.status(400).json({ status: "error", message: "Invoice is already paid" });
            return;
        }
        const orderId = `${invoice.id}-${Date.now()}`;
        const email = invoiceWithRelations.student.email_beasiswa || invoiceWithRelations.student.user.email;
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
        const transaction = await midtrans_1.snap.createTransaction(parameter);
        await prisma_1.prisma.transaction.create({
            data: {
                invoice_id: invoice.id,
                order_id_midtrans: orderId ?? null,
                snap_token: transaction.token ?? null
            }
        });
        res.json({ status: "success", data: { token: transaction.token } });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.payInvoice = payInvoice;
const payPaket = async (req, res) => {
    try {
        const { jumlahBulan } = req.body;
        const userId = req.user?.id;
        const student = await prisma_1.prisma.student.findUnique({
            where: { user_id: userId ?? '' },
            include: { user: true }
        });
        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }
        if (!jumlahBulan || typeof jumlahBulan !== 'number' || jumlahBulan < 1) {
            res.status(400).json({ status: "error", message: "Invalid jumlah bulan" });
            return;
        }
        const nominal = jumlahBulan * 250000;
        const judul = `Paket Pembayaran SPP ${jumlahBulan} Bulan`;
        const invoice = await prisma_1.prisma.invoice.create({
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
        const email = student.email_beasiswa || student.user.email;
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
        const transaction = await midtrans_1.snap.createTransaction(parameter);
        await prisma_1.prisma.transaction.create({
            data: {
                invoice_id: invoice.id,
                order_id_midtrans: orderId,
                snap_token: transaction.token ?? null
            }
        });
        res.json({ status: "success", data: { token: transaction.token } });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.payPaket = payPaket;
const getAllInvoices = async (req, res) => {
    try {
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'ADMIN';
        const where = isAdmin
            ? {}
            : { student: { user_id: userId ?? '' } };
        const invoices = await prisma_1.prisma.invoice.findMany({
            where,
            include: { student: true, transactions: true }
        });
        res.json({ status: "success", data: invoices });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAllInvoices = getAllInvoices;
const createInvoice = async (req, res) => {
    try {
        const { student_id, judul_tagihan, jenis_tagihan, bulan, nominal, tahun, tanggal_jatuh_tempo } = req.body;
        const invoice = await prisma_1.prisma.invoice.create({
            data: {
                student_id,
                judul_tagihan,
                jenis_tagihan: jenis_tagihan || 'LAINNYA',
                bulan: bulan ?? null,
                nominal: parseInt(nominal),
                tahun: parseInt(tahun) || new Date().getFullYear(),
                status: 'PENDING',
                tanggal_jatuh_tempo: tanggal_jatuh_tempo ? new Date(tanggal_jatuh_tempo) : null
            }
        });
        (0, email_controller_1.kirimEmailTagihanBaru)(invoice.id).catch(console.error);
        res.status(201).json({ status: "success", data: invoice });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.createInvoice = createInvoice;
const createMassInvoice = async (req, res) => {
    try {
        const { targetKelas, judul_tagihan, jenis_tagihan, bulan, nominal, tahun, tanggal_jatuh_tempo } = req.body;
        const whereClause = targetKelas === 'Semua' ? {} : { kelas: { startsWith: targetKelas } };
        const students = await prisma_1.prisma.student.findMany({ where: whereClause });
        if (students.length === 0) {
            res.status(404).json({ status: "error", message: "Tidak ada siswa di kelas tersebut" });
            return;
        }
        const invoicesCreated = await Promise.all(students.map(student => prisma_1.prisma.invoice.create({
            data: {
                student_id: student.id,
                judul_tagihan: judul_tagihan,
                jenis_tagihan: jenis_tagihan || 'LAINNYA',
                bulan: bulan ?? null,
                nominal: parseInt(nominal),
                tahun: parseInt(tahun) || new Date().getFullYear(),
                status: 'PENDING',
                tanggal_jatuh_tempo: tanggal_jatuh_tempo ? new Date(tanggal_jatuh_tempo) : null
            }
        })));
        invoicesCreated.forEach(inv => {
            (0, email_controller_1.kirimEmailTagihanBaru)(inv.id).catch(console.error);
        });
        res.status(201).json({ status: "success", message: `Berhasil membuat ${invoicesCreated.length} tagihan` });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.createMassInvoice = createMassInvoice;
const midtransCallback = async (req, res) => {
    try {
        const { order_id, status_code, gross_amount, signature_key, transaction_status } = req.body;
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const hashed = crypto_1.default.createHash('sha512').update(order_id + status_code + gross_amount + serverKey).digest('hex');
        if (hashed !== signature_key) {
            res.status(400).json({ status: "error", message: "Invalid signature" });
            return;
        }
        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            const transaction = await prisma_1.prisma.transaction.findFirst({
                where: { order_id_midtrans: order_id }
            });
            if (transaction) {
                await prisma_1.prisma.invoice.update({
                    where: { id: transaction.invoice_id },
                    data: { status: 'PAID', tanggal_lunas: new Date() }
                });
                const updatedTx = await prisma_1.prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: 'SUCCESS' }
                });
                (0, email_controller_1.kirimEmailPembayaranSukses)(updatedTx.id).catch(console.error);
            }
        }
        res.status(200).json({ status: "success" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.midtransCallback = midtransCallback;
const getInvoiceById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const invoice = await prisma_1.prisma.invoice.findUnique({
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
        const invoiceWithRelations = invoice;
        if (req.user?.role !== 'ADMIN' && invoiceWithRelations.student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden: You don't have access to this invoice" });
            return;
        }
        res.status(200).json({
            status: "success",
            data: invoice
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getInvoiceById = getInvoiceById;
const getInvoicesByStudent = async (req, res) => {
    try {
        const student_id = req.params.student_id;
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const student = await prisma_1.prisma.student.findUnique({
            where: { id: student_id }
        });
        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }
        const [invoices, total] = await Promise.all([
            prisma_1.prisma.invoice.findMany({
                where: { student_id: student_id },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { transactions: true }
            }),
            prisma_1.prisma.invoice.count({ where: { student_id: student_id } })
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getInvoicesByStudent = getInvoicesByStudent;
const updateInvoice = async (req, res) => {
    try {
        const id = req.params.id;
        const { judul_tagihan, nominal, tanggal_jatuh_tempo } = req.body;
        const invoice = await prisma_1.prisma.invoice.findUnique({ where: { id } });
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
        const updatedInvoice = await prisma_1.prisma.invoice.update({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res) => {
    try {
        const id = req.params.id;
        const invoice = await prisma_1.prisma.invoice.findUnique({ where: { id } });
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
        await prisma_1.prisma.invoice.delete({ where: { id } });
        res.status(200).json({
            status: "success",
            message: "Invoice deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.deleteInvoice = deleteInvoice;
const getFinancialSummary = async (req, res) => {
    try {
        const month = typeof req.query.month === 'string' ? parseInt(req.query.month) : new Date().getMonth() + 1;
        const year = typeof req.query.year === 'string' ? parseInt(req.query.year) : new Date().getFullYear();
        const [totalInvoices, paidInvoices, overdueInvoices, pendingInvoices] = await Promise.all([
            prisma_1.prisma.invoice.aggregate({
                where: { tahun: year, bulan: month.toString() },
                _sum: { nominal: true }
            }),
            prisma_1.prisma.invoice.aggregate({
                where: { status: 'PAID', tahun: year, bulan: month.toString() },
                _sum: { nominal: true }
            }),
            prisma_1.prisma.invoice.aggregate({
                where: { status: 'OVERDUE', tahun: year, bulan: month.toString() },
                _sum: { nominal: true }
            }),
            prisma_1.prisma.invoice.aggregate({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getFinancialSummary = getFinancialSummary;
const payInvoiceManual = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const { bukti_transfer_url } = req.body;
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id },
            include: { student: true }
        });
        if (!invoice) {
            res.status(404).json({ status: "error", message: "Invoice not found" });
            return;
        }
        const invoiceWithRelations = invoice;
        if (req.user?.role !== 'ADMIN' && invoiceWithRelations.student.user_id !== userId) {
            res.status(403).json({ status: "error", message: "Forbidden" });
            return;
        }
        if (invoice.status === 'PAID') {
            res.status(400).json({ status: "error", message: "Invoice is already paid" });
            return;
        }
        await prisma_1.prisma.transaction.create({
            data: {
                invoice_id: id,
                metode_bayar: 'MANUAL',
                jumlah_bayar: invoice.nominal,
                bukti_transfer_url: bukti_transfer_url ?? null,
                status: 'PENDING'
            }
        });
        res.json({ status: "success", message: "Kwitansi berhasil diunggah." });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.payInvoiceManual = payInvoiceManual;
const getPendingManualTransactions = async (req, res) => {
    try {
        const transactions = await prisma_1.prisma.transaction.findMany({
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getPendingManualTransactions = getPendingManualTransactions;
const verifyManualTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const { action } = req.body;
        const adminId = req.user?.id;
        const transaction = await prisma_1.prisma.transaction.findUnique({
            where: { id },
            include: { invoice: true }
        });
        if (!transaction || transaction.metode_bayar !== 'MANUAL') {
            res.status(404).json({ status: "error", message: "Transaction not found" });
            return;
        }
        if (action === 'accept') {
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                const updatedTx = await tx.transaction.update({
                    where: { id },
                    data: { status: 'SUCCESS', verified_at: new Date(), verified_by: adminId ?? null }
                });
                await tx.invoice.update({
                    where: { id: transaction.invoice_id },
                    data: { status: 'PAID', tanggal_lunas: new Date() }
                });
                return updatedTx;
            });
            (0, email_controller_1.kirimEmailPembayaranSukses)(result.id).catch(console.error);
            res.json({ status: "success", message: "Pembayaran diverifikasi." });
        }
        else {
            await prisma_1.prisma.transaction.update({
                where: { id },
                data: { status: 'FAILED', verified_at: new Date(), verified_by: adminId ?? null }
            });
            res.json({ status: "success", message: "Pembayaran ditolak." });
        }
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.verifyManualTransaction = verifyManualTransaction;
const adminPayInvoice = async (req, res) => {
    try {
        const id = req.params.id;
        const adminId = req.user?.id;
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id }
        });
        if (!invoice) {
            res.status(404).json({ status: "error", message: "Invoice not found" });
            return;
        }
        if (invoice.status === 'PAID') {
            res.status(400).json({ status: "error", message: "Invoice is already paid" });
            return;
        }
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: { status: 'PAID', tanggal_lunas: new Date() }
            });
            const transaction = await tx.transaction.create({
                data: {
                    invoice_id: id,
                    metode_bayar: 'BEASISWA_INTERNAL',
                    jumlah_bayar: invoice.nominal,
                    status: 'SUCCESS',
                    verified_at: new Date(),
                    verified_by: adminId ?? null
                }
            });
            return transaction;
        });
        (0, email_controller_1.kirimEmailPembayaranSukses)(result.id).catch(console.error);
        res.status(200).json({
            status: "success",
            message: "Invoice berhasil dilunasi oleh Admin (Beasiswa Internal)",
            data: result
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.adminPayInvoice = adminPayInvoice;
//# sourceMappingURL=invoice.controller.js.map