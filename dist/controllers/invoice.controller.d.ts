import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const payInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllInvoices: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createMassInvoice: (req: AuthRequest, res: Response) => Promise<void>;
export declare const midtransCallback: (req: Request, res: Response) => Promise<void>;
/**
 * Get invoice by ID
 */
export declare const getInvoiceById: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Get invoices by student
 */
export declare const getInvoicesByStudent: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Update invoice
 */
export declare const updateInvoice: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Delete invoice
 */
export declare const deleteInvoice: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Get financial summary
 */
export declare const getFinancialSummary: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=invoice.controller.d.ts.map