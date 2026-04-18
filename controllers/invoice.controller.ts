import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { snap } from '../midtrans'; // Pastikan path ini udah bener ya sesuai folder kamu


// Fungsi buat nyetak tagihan baru
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { student_id, judul_tagihan, bulan, nominal } = req.body;

        // Bikin tagihan baru di database
        const newInvoice = await prisma.invoice.create({
            data: {
                student_id,
                judul_tagihan,
                bulan,
                nominal // Angka (integer), jangan pakai kutip di Postman nanti
            }
        });

        res.status(201).json({
            status: "success",
            message: "Tagihan sukses dicetak Bosku! 💸",
            data: newInvoice
        });
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: "Gagal nyetak tagihan nih!",
            error: error.message
        });
    }
}

// Fungsi buat narik semua data tagihan
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
        // Cari semua tagihan, sekalian bawa data siswanya biar lengkap!
        const invoices = await prisma.invoice.findMany({
            include: {
                student: true // Ini keajaiban relasi, data siswa otomatis ikut ketarik!
            }
        });

        res.status(200).json({
            status: "success",
            data: invoices
        });
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: "Gagal narik data",
            error: error.message
        });
    }
}

export const bayarTagihan = async (req: Request, res: Response): Promise<any> => {
    try {
        // 1. Tangkap ID tagihan dari URL dan PAKSA jadi String (Biar TS nggak rewel)
        const invoiceId = String(req.params.id); 
        console.log("ID yang dicari:", invoiceId);

        // 2. Cari tagihan di database SEKALIAN bawa data siswanya
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId }, // <-- Baris 67: Sekarang dijamin aman karena udah murni String!
            include: { student: true } 
        });

        // Kalau tagihan nggak ada di database, tolak!
        if (!invoice) {
            return res.status(404).json({ message: "Waduh, tagihan tidak ditemukan! 👻" });
        }

        // 3. Siapkan data ASLI dari database buat Midtrans
        const parameter = {
            "transaction_details": {
                "order_id": invoice.id,
                "gross_amount": Number(invoice.nominal) 
            },
            "customer_details": {
                // Tarik nama siswa dari relasi (Asumsi nama kolomnya 'nama' di tabel student)
                "first_name": (invoice.student as any).nama_lengkap|| "Siswa", 
                "email": "siswa@sekolah.com" 
            }
        };

        // 4. Minta Token Ajaib ke satpam Midtrans
        const transaction = await snap.createTransaction(parameter);

        // 5. Berhasil! Kirim tokennya
        res.status(200).json({
            message: `Berhasil memanggil mesin kasir buat tagihan ${invoice.judul_tagihan}! 💳`,
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });

    } catch (error: any) {
        // Kalau gagal, kasih tau errornya apa
        res.status(500).json({ error: error.message });
    }
}

    // Fungsi Resepsionis buat nerima laporan dari Midtrans
export const midtransWebhook = async (req: Request, res: Response): Promise<any> => {
    try {
        // 1. Midtrans ngirim data laporan ke sini
        const data = req.body;
        
        // 2. Kita tarik ID tagihan dan status pembayarannya
        const orderId = data.order_id; // Ini isinya ID tagihan kita yang 36 huruf tadi
        const transactionStatus = data.transaction_status;
        const fraudStatus = data.fraud_status;

        // 3. Logika ngecek status: Udah Lunas apa Belum?
        let statusTagihan = 'PENDING'; // Defaultnya pending

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                statusTagihan = 'PAID'; // ALHAMDULILLAH LUNAS! 💸
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            statusTagihan = 'FAILED'; // WADUH GAGAL/EXPIRED ❌
        }

        // 4. Update statusnya di Database kesayangan kita!
        await prisma.invoice.update({
            where: { id: orderId },
            data: { status: statusTagihan as any} // <-- Ini yang merah kan?
        });

        // 5. Kasih jempol ke Midtrans tanda kita udah terima laporannya (Wajib 200 OK)
        res.status(200).json({ status: "success", message: "Siap komandan, status udah diupdate!" });

    } catch (error: any) {
        console.error("Error Webhook:", error.message);
        res.status(500).json({ error: error.message });
    }
};