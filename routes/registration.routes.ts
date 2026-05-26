import { Router } from 'express';
import {
    getAllRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration,
    acceptRegistration,
    rejectRegistration,
    checkRegistrationStatus
} from '../controllers/registration.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { validateRegistration, validateRejectRegistration } from '../middlewares/validator.middleware';

const router = Router();

router.get('/status/check', checkRegistrationStatus);
router.post('/', validateRegistration, createRegistration);
router.get('/', verifyToken, isAdmin, getAllRegistrations);
router.get('/:id', verifyToken, isAdmin, getRegistrationById);
router.put('/:id', verifyToken, isAdmin, updateRegistration);
router.put('/:id/accept', verifyToken, isAdmin, acceptRegistration);
router.put('/:id/reject', verifyToken, isAdmin, validateRejectRegistration, rejectRegistration);

export default router;