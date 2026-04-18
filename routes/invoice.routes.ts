import express from 'express';
// Pastikan path import ini sesuai sama folder kamu ya Bosku!
import { createInvoice, getInvoices, bayarTagihan, midtransWebhook } from '../controllers/invoice.controller';
const router = express.Router();

// 1. Rute buat nyetak tagihan baru 
router.post('/', createInvoice);

// 2. Rute buat narik semua data tagihan 
router.get('/', getInvoices);

// 3. RUTE JAGOAN KITA: Buat manggil Midtrans! 💳
// Perhatiin ada ':id' di tengah-tengah URL-nya
router.post('/:id/bayar', bayarTagihan);
// 4. RUTE RESEPSIONIS (Webhook Midtrans) 🔔
router.post('/webhook', midtransWebhook);

export default router;