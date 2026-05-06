import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ status: "error", message: "Unauthorized access" });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ status: "error", message: "Token not found" });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret || 'secret') as { id: string; role: string };
        
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        res.status(401).json({ status: "error", message: "Invalid or expired token" });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ status: "error", message: "Forbidden: Admin access required" });
    }
};