import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const checkFileSize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            const config = await prisma.systemConfig.findFirst();
            const maxBytes = (config?.max_upload_file_size_mb || 10) * 1024 * 1024;
            const contentLength = parseInt(req.headers['content-length'] || '0', 10);

            if (contentLength > maxBytes) {
                res.status(413).json({
                    status: "error",
                    message: `Ukuran file atau payload terlalu besar. Maksimal ${config?.max_upload_file_size_mb || 10} MB.`
                });
                return;
            }
        }
        next();
    } catch (error) {
        next();
    }
};