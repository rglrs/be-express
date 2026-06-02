import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth') || req.path.startsWith('/api/invoices/midtrans-callback')) {
            next();
            return;
        }

        const config = await prisma.systemConfig.findFirst();
        if (config?.is_maintenance) {
            res.status(503).json({
                status: "error",
                message: "Sistem sedang dalam perbaikan. Silakan coba lagi nanti."
            });
            return;
        }
        
        next();
    } catch (error) {
        next();
    }
};