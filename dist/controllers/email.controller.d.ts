import { Request, Response } from 'express';
export declare const kirimTagihanOrtu: (req: Request, res: Response) => Promise<void>;
export declare const kirimEmailPPDB: (emailOrReq: Request | string, namaOrRes?: Response | string, pwd?: string) => Promise<void>;
export declare const kirimEmailTagihanBaru: (invoiceId: string) => Promise<void>;
export declare const kirimEmailTunggakan: (invoiceId: string) => Promise<void>;
export declare const kirimEmailPembayaranSukses: (transactionId: string) => Promise<void>;
//# sourceMappingURL=email.controller.d.ts.map