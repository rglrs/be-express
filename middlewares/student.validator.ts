import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// 1. Aturan Main
const studentSchema = z.object({
    nisn: z.string().min(5, "NISN minimal 5 karakter Bos!"),
    nama_lengkap: z.string().min(3, "Nama minimal 3 huruf dong!"),
    kelas: z.string().min(2, "Kelasnya wajib diisi!"),
    user_id: z.string().min(1, "User ID nggak boleh kosong!")
});

// 2. Satpamnya (Versi Flatten - Dijamin Anti Merah!)
export const validateStudent = (req: Request, res: Response, next: NextFunction): void => {
    
    const result = studentSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            status: "error",
            message: "Waduh, format datanya ada yang salah nih!",
            // LANGSUNG PAKAI FLATTEN! Gak perlu map-map-an lagi!
            errors: result.error.flatten().fieldErrors
        });
        return; 
    }

    next();
};