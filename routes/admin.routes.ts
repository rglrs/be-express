import { Router } from 'express';
import {
    blockStudent,
    unblockStudent,
    getDashboardStats,
    updateStudentStatus,
    verifyTransaction,
    rejectTransaction
} from '../controllers/admin.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import {
    validateBlockStudent,
    validateUpdateStudentStatus,
    validateRejectRegistration
} from '../middlewares/validator.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Student management
router.post('/students/:student_id/block', validateBlockStudent, blockStudent);
router.post('/students/:student_id/unblock', unblockStudent);
router.patch('/students/:student_id/status', validateUpdateStudentStatus, updateStudentStatus);

// Transaction verification (manual payments)
router.post('/transactions/:transaction_id/verify', verifyTransaction);
router.post('/transactions/:transaction_id/reject', validateRejectRegistration, rejectTransaction);

export default router;
