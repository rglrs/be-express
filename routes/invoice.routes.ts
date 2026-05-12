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
    verifyManualTransaction
} from '../controllers/invoice.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { validateInvoice } from '../middlewares/validator.middleware';

const router = Router();

router.post('/callback', midtransCallback);
router.get('/', verifyToken, getAllInvoices);
router.get('/:id', verifyToken, getInvoiceById);
router.get('/student/:student_id', verifyToken, isAdmin, getInvoicesByStudent);
router.get('/summary/financial', verifyToken, isAdmin, getFinancialSummary);
router.post('/', verifyToken, isAdmin, validateInvoice, createInvoice);
router.post('/massal/create', verifyToken, isAdmin, validateInvoice, createMassInvoice);
router.put('/:id', verifyToken, isAdmin, validateInvoice, updateInvoice);
router.delete('/:id', verifyToken, isAdmin, deleteInvoice);
router.post('/:id/pay', verifyToken, payInvoice);

// --- Endpoints untuk Manual Transfer ---
router.post('/:id/manual-pay', verifyToken, payInvoiceManual);
router.get('/transactions/manual/pending', verifyToken, isAdmin, getPendingManualTransactions);
router.post('/transactions/:id/verify', verifyToken, isAdmin, verifyManualTransaction);

export default router;