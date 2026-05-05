import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
// Tambahkan import ini di bagian paling atas (gabungkan jika sudah ada)
import { kirimEmailPPDB } from '../controllers/email.controller';

// Lalu tambahkan rute ini di bagian bawah (sebelum export default router)
router.post('/register-ppdb', kirimEmailPPDB);