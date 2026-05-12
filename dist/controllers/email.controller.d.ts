import { Request, Response } from 'express';
export declare const kirimTagihanOrtu: (req: Request, res: Response) => Promise<void>;
/**
 * Fungsi ini dibuat fleksibel agar bisa menerima Request (dari routes)
 * atau parameter string langsung (panggilan internal dari auth.controller)
 */
export declare const kirimEmailPPDB: (req: Request | string, res?: Response | string) => Promise<void>;
//# sourceMappingURL=email.controller.d.ts.map