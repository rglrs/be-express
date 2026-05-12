import { Router } from 'express';
import {
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentDashboard,
    getStudentInvoiceSummary
} from '../controllers/student.controller';
import { verifyToken, isAdmin, isStudent } from '../middlewares/auth.middleware';
import { validateStudentUpdate } from '../middlewares/validator.middleware';

const router = Router();

// Public - Get all students (admin only)
router.get('/', verifyToken, isAdmin, getStudents);

// Student dashboard - personal
router.get('/dashboard/personal', verifyToken, isStudent, getStudentDashboard);

// Student invoice summary
router.get('/invoices/summary', verifyToken, isStudent, getStudentInvoiceSummary);

// Get student by ID
router.get('/:id', verifyToken, getStudentById);

// Update student
router.put('/:id', verifyToken, validateStudentUpdate, updateStudent);

// Delete student (admin only)
router.delete('/:id', verifyToken, isAdmin, deleteStudent);

export default router;