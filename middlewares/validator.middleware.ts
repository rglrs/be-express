import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    nisn: z.string().min(5, "NISN minimal 5 karakter"),
    nama_lengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    kelas: z.string().min(2, "Kelas minimal 2 karakter"),
    jurusan: z.string().min(2, "Jurusan minimal 2 karakter"),
    angkatan: z.string().min(4, "Angkatan minimal 4 karakter")
});

const studentUpdateSchema = z.object({
    nisn: z.string().min(5, "NISN minimal 5 karakter").optional(),
    nama_lengkap: z.string().min(3, "Nama lengkap minimal 3 karakter").optional(),
    kelas: z.string().min(2, "Kelas minimal 2 karakter").optional(),
    jurusan: z.string().optional(),
    angkatan: z.string().optional()
});

const blockStudentSchema = z.object({
    alasan_blokir: z.string().min(3, "Alasan blokir minimal 3 karakter").optional()
});

const invoiceSchema = z.object({
    student_id: z.string().uuid("Format ID siswa tidak valid"),
    judul_tagihan: z.string().min(3, "Judul tagihan minimal 3 karakter"),
    jenis_tagihan: z.enum(['SPP', 'DU', 'BUKU', 'SERAGAM', 'LAINNYA']).optional(),
    bulan: z.string().optional(),
    tahun: z.number().int().optional(),
    nominal: z.number().int().positive("Nominal harus positif"),
    tanggal_jatuh_tempo: z.string().datetime("Format tanggal tidak valid").optional()
});

const massInvoiceSchema = z.object({
    targetKelas: z.string().min(1, "Target kelas wajib diisi"),
    judul_tagihan: z.string().min(3, "Judul tagihan minimal 3 karakter"),
    jenis_tagihan: z.enum(['SPP', 'DU', 'BUKU', 'SERAGAM', 'LAINNYA']).optional(),
    bulan: z.string().optional(),
    tahun: z.number().int().optional(),
    nominal: z.number().int().positive("Nominal harus positif"),
    tanggal_jatuh_tempo: z.string().datetime("Format tanggal tidak valid").optional()
});

const registrationSchema = z.object({
    nama_lengkap: z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
    nisn: z.string().trim().min(10, "NISN harus 10 digit"),
    email: z.string().trim().email("Format email tidak valid"),
    email_beasiswa: z.string().trim().email("Format email beasiswa tidak valid").optional().or(z.literal('')),
    password: z.string().min(8, "Password minimal 8 karakter"),
    jurusan: z.string().trim().min(2, "Jurusan wajib dipilih"),
    no_hp: z.string().trim().min(10, "Nomor HP minimal 10 digit"),
    alamat: z.string().trim().min(5, "Alamat wajib diisi"),
    nama_orang_tua: z.string().trim().min(3, "Nama orang tua wajib diisi"),
    email_orang_tua: z.string().trim().email("Format email orang tua tidak valid"),
    hp_orang_tua: z.string().trim().min(10, "Nomor HP orang tua minimal 10 digit"),
    berkas_url: z.array(z.string()).min(1, "Minimal 1 berkas wajib diupload")
});

const rejectRegistrationSchema = z.object({
    alasan: z.string().min(3, "Alasan minimal 3 karakter")
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
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateStudentUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const result = studentUpdateSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateBlockStudent = (req: Request, res: Response, next: NextFunction): void => {
    const result = blockStudentSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateInvoice = (req: Request, res: Response, next: NextFunction): void => {
    const result = invoiceSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateMassInvoice = (req: Request, res: Response, next: NextFunction): void => {
    const result = massInvoiceSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
    const result = registrationSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateRejectRegistration = (req: Request, res: Response, next: NextFunction): void => {
    const result = rejectRegistrationSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateUpdateStudentStatus = (req: Request, res: Response, next: NextFunction): void => {
    const result = updateStudentStatusSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};

export const validateSystemConfig = (req: Request, res: Response, next: NextFunction): void => {
    const result = systemConfigSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "gagal", message: "Validasi gagal", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};