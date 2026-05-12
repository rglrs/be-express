"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kirimEmailPPDB = exports.kirimTagihanOrtu = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
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
/**
 * Fungsi ini dibuat fleksibel agar bisa menerima Request (dari routes)
 * atau parameter string langsung (panggilan internal dari auth.controller)
 */
const kirimEmailPPDB = async (req, res) => {
    try {
        let email;
        let nama;
        // Cek apakah dipanggil via Route API atau panggilan internal
        if (typeof req === 'object' && 'body' in req) {
            email = req.body.email;
            nama = req.body.nama;
        }
        else {
            email = req;
            nama = res;
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
                        <p style="margin: 5px 0 0 0;">Silakan login menggunakan akun yang baru saja dibuat untuk melakukan proses administrasi selanjutnya.</p>
                    </div>
                    <hr style="border: 1px solid #e2e8f0;"/>
                    <p style="color: #64748b; font-size: 12px;">Tim Penerimaan Peserta Didik Baru - SORA Digitalization</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        // Jika res adalah objek Response Express, kirimkan json back
        if (res && typeof res === 'object' && 'status' in res) {
            res.status(200).json({ status: "success", message: "PPDB email sent" });
        }
    }
    catch (error) {
        if (res && typeof res === 'object' && 'status' in res) {
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
};
exports.kirimEmailPPDB = kirimEmailPPDB;
//# sourceMappingURL=email.controller.js.map