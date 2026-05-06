import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    nisn: z.string().min(5, "NISN must be at least 5 characters"),
    nama_lengkap: z.string().min(3, "Name must be at least 3 characters"),
    kelas: z.string().min(2, "Class is required")
});

const studentUpdateSchema = z.object({
    nisn: z.string().min(5).optional(),
    nama_lengkap: z.string().min(3).optional(),
    kelas: z.string().min(2).optional()
});

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors
        });
        return;
    }
    next();
};

export const validateStudentUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const result = studentUpdateSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors
        });
        return;
    }
    next();
};