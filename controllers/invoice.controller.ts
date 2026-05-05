import { Request, Response } from 'express';
import { snap } from '../midtrans'; 

export const payInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // JURUS BARU: Tangkap nominal dari React! Kalau React tidak ngirim, baru pakai 250000
        const nominalDariReact = req.body.nominal || 250000;

        const parameter = {
            transaction_details: {
                order_id: `${id}-${Date.now()}`, 
                gross_amount: nominalDariReact // <--- Masukkan ke sini!
            },
            customer_details: {
                first_name: "Siswa",
                last_name: "SORA",
                email: "siswa@sora.com"
            },
            callbacks: {
                finish: "http://localhost:5173/siswa",
                error: "http://localhost:5173/siswa",
                pending: "http://localhost:5173/siswa"
            }
        };

        const transaction = await snap.createTransaction(parameter);
        res.json({ token: transaction.token });

    } catch (error) {
        console.error("Gagal buat tiket Midtrans:", error);
        res.status(500).json({ message: "Server pusing bikin tiket Midtrans" });
    }
};