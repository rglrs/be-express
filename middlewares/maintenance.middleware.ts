import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const publicPaths = [
            '/api/auth',
            '/api/system-config',
            '/api/invoices/midtrans-callback'
        ];

        if (publicPaths.some(path => req.path.startsWith(path))) {
            next();
            return;
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const secret = process.env.JWT_SECRET as string || 'secret';
                    const decoded = jwt.verify(token, secret) as { id: string; role: string };

                    if (decoded.role === 'ADMIN') {
                        next();
                        return;
                    }
                } catch (err) {}
            }
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