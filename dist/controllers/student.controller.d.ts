import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getStudents: (req: Request, res: Response) => Promise<void>;
export declare const getStudentById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStudentDashboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStudentInvoiceSummary: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=student.controller.d.ts.map