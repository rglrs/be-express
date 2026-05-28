import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const studentSchema = z.object({
    nisn: z.string().min(5, "NISN minimal 5 karakter"),
    nama_lengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    kelas: z.string().min(2, "Kelas wajib diisi"),
    user_id: z.string().min(1, "User ID wajib diisi")
});

export const validateStudent = (req: Request, res: Response, next: NextFunction): void => {
    const result = studentSchema.safeParse(req.body);
    
    if (!result.success) {
        res.status(400).json({
            status: "gagal",
            message: "Validasi gagal",
            errors: result.error.flatten().fieldErrors
        });
        return;
    }
    
    next();
};