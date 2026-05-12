import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    nisn: z.string().min(5, "NISN must be at least 5 characters"),
    nama_lengkap: z.string().min(3, "Name must be at least 3 characters"),
    kelas: z.string().min(2, "Class is required"),
    jurusan: z.string().optional(),
    angkatan: z.string().optional() // <--- Tambahan
});

const studentUpdateSchema = z.object({
    nisn: z.string().min(5).optional(),
    nama_lengkap: z.string().min(3).optional(),
    kelas: z.string().min(2).optional(),
    jurusan: z.string().optional(),
    angkatan: z.string().optional() // <--- Tambahan
});

const blockStudentSchema = z.object({
    alasan_blokir: z.string().min(3, "Reason must be at least 3 characters").optional()
});

const invoiceSchema = z.object({
    student_id: z.string().uuid("Invalid student ID"),
    judul_tagihan: z.string().min(3, "Invoice title must be at least 3 characters"),
    jenis_tagihan: z.enum(['SPP', 'DU', 'BUKU', 'SERAGAM', 'LAINNYA']).optional(),
    bulan: z.string().optional(),
    nominal: z.number().int().positive("Nominal must be positive"),
    tanggal_jatuh_tempo: z.string().datetime().optional()
});

const registrationSchema = z.object({
    nama_lengkap: z.string().min(3, "Name must be at least 3 characters"),
    nisn: z.string().min(10, "NISN must be at least 10 characters"),
    email: z.string().email("Invalid email format"),
    jurusan: z.string().min(2, "Jurusan is required"),
    nama_orang_tua: z.string().min(3).optional(),
    hp_orang_tua: z.string().optional(),
    berkas_url: z.array(z.string()).optional()
});

const acceptRegistrationSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters")
});

const rejectRegistrationSchema = z.object({
    alasan: z.string().min(3, "Reason must be at least 3 characters")
});

const updateStudentStatusSchema = z.object({
    status: z.enum(['AKTIF', 'UNDUR_DIRI', 'KELUAR'])
});

const systemConfigSchema = z.object({
    batas_hari_jatuh_tempo: z.number().int().positive().optional(),
    batas_hari_tunggakan: z.number().int().positive().optional(),
    persentase_denda_per_hari: z.number().positive().optional(),
    email_reminder_hari_ke: z.number().int().positive().optional(),
    aktifkan_notifikasi_email: z.boolean().optional(),
    aktifkan_payment_gateway: z.boolean().optional(),
    max_upload_file_size_mb: z.number().int().positive().optional()
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

export const validateBlockStudent = (req: Request, res: Response, next: NextFunction): void => {
    const result = blockStudentSchema.safeParse(req.body);
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

export const validateInvoice = (req: Request, res: Response, next: NextFunction): void => {
    const result = invoiceSchema.safeParse(req.body);
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

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
    const result = registrationSchema.safeParse(req.body);
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

export const validateAcceptRegistration = (req: Request, res: Response, next: NextFunction): void => {
    const result = acceptRegistrationSchema.safeParse(req.body);
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

export const validateRejectRegistration = (req: Request, res: Response, next: NextFunction): void => {
    const result = rejectRegistrationSchema.safeParse(req.body);
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

export const validateUpdateStudentStatus = (req: Request, res: Response, next: NextFunction): void => {
    const result = updateStudentStatusSchema.safeParse(req.body);
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

export const validateSystemConfig = (req: Request, res: Response, next: NextFunction): void => {
    const result = systemConfigSchema.safeParse(req.body);
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