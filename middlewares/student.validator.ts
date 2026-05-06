import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const studentSchema = z.object({
    nisn: z.string().min(5, "NISN must be at least 5 characters long"),
    nama_lengkap: z.string().min(3, "Name must be at least 3 characters long"),
    kelas: z.string().min(2, "Class field is required"),
    user_id: z.string().min(1, "User ID is required")
});

export const validateStudent = (req: Request, res: Response, next: NextFunction): void => {
    const result = studentSchema.safeParse(req.body);
    
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