"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kirimEmailPembayaranSukses = exports.kirimEmailTunggakan = exports.kirimEmailTagihanBaru = exports.kirimEmailPPDB = exports.kirimTagihanOrtu = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = require("../utils/prisma");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
const getTargetEmail = (student) => {
    if (student.email_beasiswa)
        return student.email_beasiswa;
    if (student.user && student.user.email)
        return student.user.email;
    if (student.email_orang_tua)
        return student.email_orang_tua;
    return '';
};
const kirimTagihanOrtu = async (req, res) => {
    try {
        const { emailOrtu, namaSiswa, nominal, bulan } = req.body;
        const mailOptions = {
            from: '"SORA Keuangan" <noreply@sora.com>',
            to: emailOrtu,
            subject: `Pemberitahuan Tagihan SPP - ${namaSiswa}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Halo Orang Tua/Wali dari ${namaSiswa},</h2>
                    <p>Mengingatkan bahwa tagihan SPP bulan <b>${bulan}</b> sebesar <b>Rp ${nominal}</b> belum dilunasi.</p>
                    <p>Mohon segera melakukan pembayaran melalui portal siswa.</p>
                    <hr/>
                    <p><small>Sistem Operasional dan Administrasi SORA</small></p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ status: "success", message: "Invoice email sent" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Failed to send email" });
    }
};
exports.kirimTagihanOrtu = kirimTagihanOrtu;
const kirimEmailPPDB = async (emailOrReq, namaOrRes, pwd) => {
    try {
        let email;
        let nama;
        let password = pwd || '';
        if (typeof emailOrReq === 'object' && 'body' in emailOrReq) {
            email = emailOrReq.body.email;
            nama = emailOrReq.body.nama;
            password = emailOrReq.body.password || password;
        }
        else {
            email = emailOrReq;
            nama = namaOrRes;
        }
        const mailOptions = {
            from: '"Panitia PPDB SORA" <noreply@sora.com>',
            to: email,
            subject: `Pendaftaran PPDB Berhasil - ${nama}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
                    <h2 style="color: #1e3a8a;">Halo, ${nama}!</h2>
                    <p>Terima kasih telah mendaftar di <b>Sekolah SORA</b>.</p>
                    <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        <p style="margin: 0;"><b>Langkah Selanjutnya:</b></p>
                        <p style="margin: 5px 0 0 0;">Data Anda telah masuk ke sistem kami dan sedang menunggu verifikasi admin.</p>
                        <p style="margin: 10px 0 0 0;">Jika akun Anda sudah disetujui, Anda dapat masuk ke dalam portal siswa menggunakan kredensial berikut:</p>
                        <div style="margin-top: 15px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
                            <p style="margin: 0; color: #475569; font-size: 14px;">Email: <b style="color: #0f172a;">${email}</b></p>
                            <p style="margin: 5px 0 0 0; color: #475569; font-size: 14px;">Password: <b style="color: #0f172a;">${password}</b></p>
                        </div>
                    </div>
                    <hr style="border: 1px solid #e2e8f0;"/>
                    <p style="color: #64748b; font-size: 12px;">Tim Penerimaan Peserta Didik Baru - SORA Digitalization</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        if (namaOrRes && typeof namaOrRes === 'object' && 'status' in namaOrRes) {
            namaOrRes.status(200).json({ status: "success", message: "PPDB email sent" });
        }
    }
    catch (error) {
        if (namaOrRes && typeof namaOrRes === 'object' && 'status' in namaOrRes) {
            namaOrRes.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
};
exports.kirimEmailPPDB = kirimEmailPPDB;
const kirimEmailTagihanBaru = async (invoiceId) => {
    try {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { student: { include: { user: true } } }
        });
        if (!invoice)
            return;
        const targetEmail = getTargetEmail(invoice.student);
        if (!targetEmail)
            return;
        const pendingInvoices = await prisma_1.prisma.invoice.findMany({
            where: {
                student_id: invoice.student_id,
                status: { in: ['PENDING', 'OVERDUE'] },
                id: { not: invoiceId }
            }
        });
        const totalUnpaid = pendingInvoices.reduce((sum, inv) => sum + inv.nominal, 0);
        let unpaidHtml = '';
        if (pendingInvoices.length > 0) {
            unpaidHtml = `
                <div style="margin-top: 20px; padding: 15px; background-color: #fff1f2; border-left: 4px solid #e11d48;">
                    <p style="margin: 0 0 10px 0; color: #e11d48; font-weight: bold;">Rincian Tunggakan Lainnya:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #4c0519; font-size: 14px;">
                        ${pendingInvoices.map(inv => `<li>${inv.judul_tagihan} - Rp ${inv.nominal.toLocaleString('id-ID')}</li>`).join('')}
                    </ul>
                    <p style="margin: 10px 0 0 0; font-weight: bold; color: #e11d48;">Total Tunggakan Sebelumnya: Rp ${totalUnpaid.toLocaleString('id-ID')}</p>
                </div>
            `;
        }
        const mailOptions = {
            from: '"SORA Keuangan" <noreply@sora.com>',
            to: targetEmail,
            subject: `Tagihan Baru: ${invoice.judul_tagihan}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc;">
                    <h2 style="color: #1e3a8a;">Informasi Tagihan Baru</h2>
                    <p>Yth. ${invoice.student.nama_lengkap},</p>
                    <p>Berikut adalah rincian tagihan baru Anda:</p>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <p><strong>Judul Tagihan:</strong> ${invoice.judul_tagihan}</p>
                        <p><strong>Kategori:</strong> ${invoice.jenis_tagihan}</p>
                        <p><strong>Nominal:</strong> Rp ${invoice.nominal.toLocaleString('id-ID')}</p>
                    </div>
                    ${unpaidHtml}
                    <p style="margin-top: 20px;">Mohon segera melakukan pembayaran melalui portal siswa.</p>
                    <hr style="border: 1px solid #e2e8f0; margin-top: 30px;"/>
                    <p style="color: #64748b; font-size: 12px;">Keuangan - SORA Digitalization</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        await prisma_1.prisma.emailLog.create({
            data: {
                student_id: invoice.student_id,
                invoice_id: invoice.id,
                jenis: 'TAGIHAN_BARU',
                to_email: targetEmail,
                subject: mailOptions.subject,
                status: 'SENT'
            }
        });
    }
    catch (error) {
        console.error("Gagal mengirim email tagihan baru", error);
    }
};
exports.kirimEmailTagihanBaru = kirimEmailTagihanBaru;
const kirimEmailTunggakan = async (invoiceId) => {
    try {
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { student: { include: { user: true } } }
        });
        if (!invoice)
            return;
        const targetEmail = getTargetEmail(invoice.student);
        if (!targetEmail)
            return;
        const pendingInvoices = await prisma_1.prisma.invoice.findMany({
            where: {
                student_id: invoice.student_id,
                status: { in: ['PENDING', 'OVERDUE'] }
            }
        });
        const totalUnpaid = pendingInvoices.reduce((sum, inv) => sum + inv.nominal, 0);
        const mailOptions = {
            from: '"SORA Keuangan" <noreply@sora.com>',
            to: targetEmail,
            subject: `Peringatan Tunggakan: ${invoice.judul_tagihan}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #fff1f2;">
                    <h2 style="color: #e11d48;">Peringatan Tagihan Jatuh Tempo</h2>
                    <p>Yth. ${invoice.student.nama_lengkap},</p>
                    <p>Kami mengingatkan bahwa tagihan berikut telah melewati batas waktu pembayaran:</p>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #fda4af;">
                        <p><strong>Judul Tagihan:</strong> ${invoice.judul_tagihan}</p>
                        <p><strong>Nominal:</strong> Rp ${invoice.nominal.toLocaleString('id-ID')}</p>
                    </div>
                    <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold;">Seluruh Daftar Tagihan Belum Lunas:</p>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                            ${pendingInvoices.map(inv => `<li>${inv.judul_tagihan} - Rp ${inv.nominal.toLocaleString('id-ID')}</li>`).join('')}
                        </ul>
                        <p style="margin: 10px 0 0 0; font-weight: bold; font-size: 16px;">Total Keseluruhan: Rp ${totalUnpaid.toLocaleString('id-ID')}</p>
                    </div>
                    <hr style="border: 1px solid #fda4af; margin-top: 30px;"/>
                    <p style="color: #64748b; font-size: 12px;">Keuangan - SORA Digitalization</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        await prisma_1.prisma.emailLog.create({
            data: {
                student_id: invoice.student_id,
                invoice_id: invoice.id,
                jenis: 'KETERLAMBATAN',
                to_email: targetEmail,
                subject: mailOptions.subject,
                status: 'SENT'
            }
        });
    }
    catch (error) {
        console.error("Gagal mengirim email peringatan tunggakan", error);
    }
};
exports.kirimEmailTunggakan = kirimEmailTunggakan;
const kirimEmailPembayaranSukses = async (transactionId) => {
    try {
        const transaction = await prisma_1.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { invoice: { include: { student: { include: { user: true } } } } }
        });
        if (!transaction || !transaction.invoice)
            return;
        const targetEmail = getTargetEmail(transaction.invoice.student);
        if (!targetEmail)
            return;
        const nominalBayar = transaction.jumlah_bayar || transaction.invoice.nominal;
        const mailOptions = {
            from: '"SORA Keuangan" <noreply@sora.com>',
            to: targetEmail,
            subject: `Pembayaran Berhasil: ${transaction.invoice.judul_tagihan}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f0fdf4;">
                    <h2 style="color: #16a34a;">Pembayaran Diterima</h2>
                    <p>Yth. ${transaction.invoice.student.nama_lengkap},</p>
                    <p>Terima kasih, pembayaran Anda telah berhasil diverifikasi oleh sistem.</p>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #86efac;">
                        <p><strong>Judul Tagihan:</strong> ${transaction.invoice.judul_tagihan}</p>
                        <p><strong>Metode Pembayaran:</strong> ${transaction.metode_bayar || 'Otomatis Midtrans'}</p>
                        <p><strong>Nominal Dibayar:</strong> Rp ${nominalBayar.toLocaleString('id-ID')}</p>
                        <p><strong>Tanggal Verifikasi:</strong> ${new Date().toLocaleString('id-ID')}</p>
                    </div>
                    <hr style="border: 1px solid #86efac; margin-top: 30px;"/>
                    <p style="color: #64748b; font-size: 12px;">Keuangan - SORA Digitalization</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        await prisma_1.prisma.emailLog.create({
            data: {
                student_id: transaction.invoice.student_id,
                invoice_id: transaction.invoice.id,
                jenis: 'PEMBAYARAN_BERHASIL',
                to_email: targetEmail,
                subject: mailOptions.subject,
                status: 'SENT'
            }
        });
    }
    catch (error) {
        console.error("Gagal mengirim email pembayaran sukses", error);
    }
};
exports.kirimEmailPembayaranSukses = kirimEmailPembayaranSukses;
//# sourceMappingURL=email.controller.js.map