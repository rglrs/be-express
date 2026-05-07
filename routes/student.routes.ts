import { Router } from 'express';
import { 
    getStudents, 
    getStudentById, 
    updateStudent, 
    deleteStudent 
} from '../controllers/student.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { validateStudentUpdate } from '../middlewares/validator.middleware';

const router = Router();

router.get('/', verifyToken, isAdmin, getStudents);          
router.get('/:id', verifyToken, getStudentById);           
router.put('/:id', verifyToken, validateStudentUpdate, updateStudent);      
router.delete('/:id', verifyToken, isAdmin, deleteStudent);   

export default router;