import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getAllRegistrations: (req: Request, res: Response) => Promise<void>;
export declare const getRegistrationById: (req: Request, res: Response) => Promise<void>;
export declare const acceptRegistration: (req: AuthRequest, res: Response) => Promise<void>;
export declare const rejectRegistration: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createRegistration: (req: Request, res: Response) => Promise<void>;
export declare const updateRegistration: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=registration.controller.d.ts.map