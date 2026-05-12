import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const blockStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const unblockStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateStudentStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const verifyTransaction: (req: AuthRequest, res: Response) => Promise<void>;
export declare const rejectTransaction: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map