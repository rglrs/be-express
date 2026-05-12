import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getAuditLogs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAuditLogDetail: (req: Request, res: Response) => Promise<void>;
export declare const getAuditLogsByStudent: (req: Request, res: Response) => Promise<void>;
export declare const getAuditLogsByAdmin: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=audit.controller.d.ts.map