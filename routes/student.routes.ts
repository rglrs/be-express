import { Router } from 'express';
import { 
    getStudents, 
    getStudentById, 
    createStudent, 
    updateStudent, 
    deleteStudent 
} from '../controllers/student.controller';

const router = Router();

// Rute-rute sakti kita:
router.get('/', getStudents);          // GET All
router.get('/:id', getStudentById);    // GET 1 Siswa doang
router.post('/', createStudent);       // POST (Tambah)
router.put('/:id', updateStudent);     // PUT (Edit)
router.delete('/:id', deleteStudent);  // DELETE (Hapus)

export default router;