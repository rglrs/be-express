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
    payPaket,
    adminPayInvoice
} from '../controllers/invoice.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { validateInvoice, validateMassInvoice } from '../middlewares/validator.middleware';

const router = Router();

router.post('/callback', midtransCallback);
router.get('/', verifyToken, getAllInvoices);
router.get('/:id', verifyToken, getInvoiceById);
router.get('/student/:student_id', verifyToken, isAdmin, getInvoicesByStudent);
router.get('/summary/financial', verifyToken, isAdmin, getFinancialSummary);
router.post('/', verifyToken, isAdmin, validateInvoice, createInvoice);
router.post('/massal/create', verifyToken, isAdmin, validateMassInvoice, createMassInvoice);
router.put('/:id', verifyToken, isAdmin, validateInvoice, updateInvoice);
router.delete('/:id', verifyToken, isAdmin, deleteInvoice);
router.post('/:id/pay', verifyToken, payInvoice);
router.post('/paket', verifyToken, payPaket);
router.post('/:id/manual-pay', verifyToken, payInvoiceManual);
router.post('/:id/admin-pay', verifyToken, isAdmin, adminPayInvoice);
router.get('/transactions/manual/pending', verifyToken, isAdmin, getPendingManualTransactions);
router.post('/transactions/:id/verify', verifyToken, isAdmin, verifyManualTransaction);

export default router;