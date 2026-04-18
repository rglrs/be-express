import express from 'express';
// 1. Import nama satpam yang BENER dari file middleware kamu
import { verifyToken, isAdmin } from '../middlewares/auth.middleware'; 
import { createInvoice, getInvoices, bayarTagihan, midtransWebhook } from '../controllers/invoice.controller';

const router = express.Router();

// ==========================================
// RUTE RAHASIA (Cuma bisa dibuka sama Admin)
// ==========================================
// Pasang Satpam 1 (verifyToken) & Satpam 2 (isAdmin) berurutan
router.post('/', verifyToken, isAdmin, createInvoice); 
router.get('/', verifyToken, isAdmin, getInvoices);    

// ==========================================
// RUTE SISWA (Cuma butuh login buat bayar, gak perlu Admin)
// ==========================================
// Cukup pasang Satpam 1 (verifyToken) aja
router.post('/:id/bayar', verifyToken, bayarTagihan); 

// ==========================================
// RUTE ROBOT MIDTRANS (Pintu ngablak)
// ==========================================
// JANGAN DIKASIH SATPAM! Biar webhook bisa masuk 🤖
router.post('/webhook', midtransWebhook);

export default router;