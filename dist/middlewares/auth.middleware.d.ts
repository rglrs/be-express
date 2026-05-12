import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}
export declare const verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const isStudent: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map