import { Router } from 'express';
import {
    payInvoice,
    getAllInvoices,
    createInvoice,
    createMassInvoice,
    midtransCallback,
    getInvoiceById,
    getInvoicesByStudent,
    updateInvoice,
    deleteInvoice,
    getFinancialSummary,
    payInvoiceManual,
    getPendingManualTransactions,
    verifyManualTransaction,
    payPaket
} from '../controllers/invoice.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { validateInvoice, validateMassInvoice } from '../middlewares/validator.middleware';

const router = Router();

router.post('/callback', midtransCallback);
router.get('/', verifyToken, getAllInvoices);
router.get('/:id', verifyToken, getInvoiceById);
router.get('/student/:student_id', verifyToken, isAdmin, getInvoicesByStudent);
router.get('/summary/financial', verifyToken, isAdmin, getFinancialSummary);

// Validasi individu
router.post('/', verifyToken, isAdmin, validateInvoice, createInvoice);

// Validasi massal menggunakan validateMassInvoice
router.post('/massal/create', verifyToken, isAdmin, validateMassInvoice, createMassInvoice);

router.put('/:id', verifyToken, isAdmin, validateInvoice, updateInvoice);
router.delete('/:id', verifyToken, isAdmin, deleteInvoice);
router.post('/:id/pay', verifyToken, payInvoice);
router.post('/paket', verifyToken, payPaket);
router.post('/:id/manual-pay', verifyToken, payInvoiceManual);
router.get('/transactions/manual/pending', verifyToken, isAdmin, getPendingManualTransactions);
router.post('/transactions/:id/verify', verifyToken, isAdmin, verifyManualTransaction);

export default router;