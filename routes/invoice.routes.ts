import { Router } from 'express';
import { payInvoice, getAllInvoices, createInvoice, createMassInvoice, midtransCallback } from '../controllers/invoice.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/callback', midtransCallback);

router.get('/', verifyToken, getAllInvoices);
router.post('/massal', verifyToken, isAdmin, createMassInvoice);
router.post('/', verifyToken, isAdmin, createInvoice);
router.post('/:id/pay', verifyToken, payInvoice);

export default router;