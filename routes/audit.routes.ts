import { Router } from 'express';
import {
    getAuditLogs,
    getAuditLogDetail,
    getAuditLogsByStudent,
    getAuditLogsByAdmin
} from '../controllers/audit.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// All audit routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Get all audit logs
router.get('/', getAuditLogs);

// Get audit log detail
router.get('/:id', getAuditLogDetail);

// Get audit logs by student
router.get('/student/:student_id', getAuditLogsByStudent);

// Get audit logs by admin
router.get('/admin/:admin_id', getAuditLogsByAdmin);

export default router;
