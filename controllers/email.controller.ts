import nodemailer from 'nodemailer';
import { Request, Response } from 'express'; // <-- Tambahan ini biar TypeScript diam

// Konfigurasi SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string
  }
});

// <-- req dan res sekarang sudah dikasih identitas Request dan Response
export const kirimTagihanOrtu = async (req: Request, res: Response) => { 
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
        res.status(200).json({ message: "Email ke Orang Tua berhasil dikirim!" });
    } catch (error) {
        console.error("Error SMTP:", error);
        res.status(500).json({ error: "Gagal mengirim SMTP Email" });
    }
};
// Fungsi khusus untuk mengirim email sukses pendaftaran PPDB
export const kirimEmailPPDB = async (req: Request, res: Response) => {
    try {
        const { email, nama, asalSekolah } = req.body;

        const mailOptions = {
            from: '"Panitia PPDB SORA" <noreply@sora.com>',
            to: email, // Kirim ke email yang diinput di form
            subject: `Pendaftaran PPDB Berhasil - ${nama}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
                    <h2 style="color: #1e3a8a;">Halo, ${nama}! 🎉</h2>
                    <p>Terima kasih telah mendaftar di <b>Sekolah SORA</b>.</p>
                    <p>Data kamu dari <b>${asalSekolah}</b> sudah kami terima di sistem kami.</p>
                    <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        <p style="margin: 0;"><b>Langkah Selanjutnya:</b></p>
                        <p style="margin: 5px 0 0 0;">Silakan lakukan pembayaran biaya formulir pendaftaran sebesar <b>Rp 150.000</b> melalui portal untuk mendapatkan Kartu Ujian Masuk.</p>
                    </div>
                    <p>Jika ada pertanyaan, silakan balas email ini.</p>
                    <hr style="border: 1px solid #e2e8f0;"/>
                    <p style="color: #64748b; font-size: 12px;">Tim Penerimaan Peserta Didik Baru - SORA Digitalization</p>
                </div>
            `
        };

        // Perintah untuk benar-benar mengirim email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email PPDB berhasil dikirim!" });
    } catch (error) {
        console.error("Error SMTP PPDB:", error);
        res.status(500).json({ error: "Gagal mengirim email PPDB" });
    }
};