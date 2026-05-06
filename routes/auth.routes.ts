import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { kirimEmailPPDB } from '../controllers/email.controller';
import { validateRegister } from '../middlewares/validator.middleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/register-ppdb', kirimEmailPPDB);

export default router;