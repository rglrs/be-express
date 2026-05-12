import { Router } from 'express';
import { 
    getMasterData, getPublicMajors, createMajor, deleteMajor, 
    createGrade, deleteGrade, 
    createAcademicYear, toggleAcademicYear, deleteAcademicYear 
} from '../controllers/master.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/public/majors', getPublicMajors);
router.get('/', verifyToken, getMasterData);
router.post('/major', verifyToken, isAdmin, createMajor);
router.delete('/major/:id', verifyToken, isAdmin, deleteMajor);
router.post('/grade', verifyToken, isAdmin, createGrade);
router.delete('/grade/:id', verifyToken, isAdmin, deleteGrade);
router.post('/year', verifyToken, isAdmin, createAcademicYear);
router.patch('/year/:id/activate', verifyToken, isAdmin, toggleAcademicYear);
router.delete('/year/:id', verifyToken, isAdmin, deleteAcademicYear);

export default router;