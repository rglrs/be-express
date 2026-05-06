import { Router } from 'express';
import { payInvoice, getAllInvoices } from '../controllers/invoice.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken, getAllInvoices);
router.post('/:id/pay', verifyToken, payInvoice);

export default router;