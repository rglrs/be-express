import { Router, Request, Response } from 'express';
import { register, login, changePassword } from '../controllers/auth.controller';
import { kirimEmailPPDB } from '../controllers/email.controller';
import { validateRegister } from '../middlewares/validator.middleware';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/register-ppdb', (req: Request, res: Response) => {
    kirimEmailPPDB(req, res);
});
router.post('/change-password', verifyToken, changePassword);

export default router;