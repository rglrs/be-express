import { Router } from 'express';
import { payInvoice } from '../controllers/invoice.controller';

const router = Router();

// INI DIA PINTU YANG DICARI-CARI SAMA REACT TADI!
router.post('/:id/pay', payInvoice);

export default router;