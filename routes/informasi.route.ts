import { Router } from 'express';
import { getAllBroadcasts, createBroadcast, deleteBroadcast, getAllKalender, createKalender, deleteKalender } from '../controllers/informasi.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/broadcast', verifyToken, getAllBroadcasts);
router.post('/broadcast', verifyToken, isAdmin, createBroadcast);
router.delete('/broadcast/:id', verifyToken, isAdmin, deleteBroadcast);

router.get('/kalender', verifyToken, getAllKalender);
router.post('/kalender', verifyToken, isAdmin, createKalender);
router.delete('/kalender/:id', verifyToken, isAdmin, deleteKalender);

export default router;