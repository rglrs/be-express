import { Router } from 'express';
import { 
    getStudents, 
    getStudentById, 
    createStudent, 
    updateStudent, 
    deleteStudent 
} from '../controllers/student.controller';
// 1. Panggil Satpam KTP (verifyToken) & Komandan Kasta (isAdmin)
import { verifyToken, isAdmin } from '../middlewares/auth.middleware'; 
// 2. Panggil Satpam Typo (Zod)
import { validateStudent } from '../middlewares/student.validator';

const router = Router();

// GET cuma butuh Satpam KTP (Semua user yang login boleh lihat data)
router.get('/', verifyToken, getStudents);          
router.get('/:id', verifyToken, getStudentById);    

// POST & PUT dijaga 3 LAPIS: Login -> Harus Admin -> Format Data Harus Valid (Zod)
router.post('/', verifyToken, isAdmin, validateStudent, createStudent);       
router.put('/:id', verifyToken, isAdmin, validateStudent, updateStudent);     

// DELETE dijaga 2 LAPIS: Login -> Harus Admin (Nggak butuh Zod karena dia nggak ngirim body JSON)
router.delete('/:id', verifyToken, isAdmin, deleteStudent);  
 
export default router;