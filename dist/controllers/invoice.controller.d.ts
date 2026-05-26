import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const payInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const payPaket: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllInvoices: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createMassInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const midtransCallback: (req: Request, res: Response) => Promise<void>;
export declare const getInvoiceById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getInvoicesByStudent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFinancialSummary: (req: AuthRequest, res: Response) => Promise<void>;
export declare const payInvoiceManual: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPendingManualTransactions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const verifyManualTransaction: (req: AuthRequest, res: Response) => Promise<void>;
export declare const adminPayInvoice: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=invoice.controller.d.ts.map