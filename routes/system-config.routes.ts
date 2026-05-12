import { Router } from 'express';
import {
    getConfig,
    updateConfig
} from '../controllers/system-config.controller';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import { validateSystemConfig } from '../middlewares/validator.middleware';

const router = Router();

// Public - anyone can view config
router.get('/', getConfig);

// Admin - only admin can update config
router.put('/', verifyToken, isAdmin, validateSystemConfig, updateConfig);

export default router;
