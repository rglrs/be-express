"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSystemConfig = exports.validateUpdateStudentStatus = exports.validateRejectRegistration = exports.validateRegistration = exports.validateMassInvoice = exports.validateInvoice = exports.validateBlockStudent = exports.validateStudentUpdate = exports.validateRegister = void 0;
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    nisn: zod_1.z.string().min(5),
    nama_lengkap: zod_1.z.string().min(3),
    kelas: zod_1.z.string().min(2),
    jurusan: zod_1.z.string().min(2),
    angkatan: zod_1.z.string().min(4)
});
const studentUpdateSchema = zod_1.z.object({
    nisn: zod_1.z.string().min(5).optional(),
    nama_lengkap: zod_1.z.string().min(3).optional(),
    kelas: zod_1.z.string().min(2).optional(),
    jurusan: zod_1.z.string().optional(),
    angkatan: zod_1.z.string().optional()
});
const blockStudentSchema = zod_1.z.object({
    alasan_blokir: zod_1.z.string().min(3).optional()
});
const invoiceSchema = zod_1.z.object({
    student_id: zod_1.z.string().uuid(),
    judul_tagihan: zod_1.z.string().min(3),
    jenis_tagihan: zod_1.z.enum(['SPP', 'DU', 'BUKU', 'SERAGAM', 'LAINNYA']).optional(),
    bulan: zod_1.z.string().optional(),
    tahun: zod_1.z.number().int().optional(),
    nominal: zod_1.z.number().int().positive(),
    tanggal_jatuh_tempo: zod_1.z.string().datetime().optional()
});
const massInvoiceSchema = zod_1.z.object({
    targetKelas: zod_1.z.string().min(1),
    judul_tagihan: zod_1.z.string().min(3),
    jenis_tagihan: zod_1.z.enum(['SPP', 'DU', 'BUKU', 'SERAGAM', 'LAINNYA']).optional(),
    bulan: zod_1.z.string().optional(),
    tahun: zod_1.z.number().int().optional(),
    nominal: zod_1.z.number().int().positive(),
    tanggal_jatuh_tempo: zod_1.z.string().datetime().optional()
});
const registrationSchema = zod_1.z.object({
    nama_lengkap: zod_1.z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
    nisn: zod_1.z.string().trim().min(10, "NISN harus 10 digit"),
    email: zod_1.z.string().trim().email("Format email tidak valid"),
    email_beasiswa: zod_1.z.string().trim().email("Format email beasiswa tidak valid").optional().or(zod_1.z.literal('')),
    password: zod_1.z.string().min(6, "Password minimal 6 karakter"),
    jurusan: zod_1.z.string().trim().min(2, "Jurusan wajib dipilih"),
    no_hp: zod_1.z.string().trim().min(10, "Nomor HP minimal 10 digit"),
    alamat: zod_1.z.string().trim().min(5, "Alamat wajib diisi"),
    nama_orang_tua: zod_1.z.string().trim().min(3, "Nama orang tua wajib diisi"),
    email_orang_tua: zod_1.z.string().trim().email("Format email orang tua tidak valid"),
    hp_orang_tua: zod_1.z.string().trim().min(10, "Nomor HP orang tua minimal 10 digit"),
    berkas_url: zod_1.z.array(zod_1.z.string()).min(1, "Minimal 1 berkas wajib diupload")
});
const rejectRegistrationSchema = zod_1.z.object({
    alasan: zod_1.z.string().min(3)
});
const updateStudentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['AKTIF', 'UNDUR_DIRI', 'KELUAR'])
});
const systemConfigSchema = zod_1.z.object({
    batas_hari_jatuh_tempo: zod_1.z.number().int().positive().optional(),
    batas_hari_tunggakan: zod_1.z.number().int().positive().optional(),
    persentase_denda_per_hari: zod_1.z.number().positive().optional(),
    email_reminder_hari_ke: zod_1.z.number().int().positive().optional(),
    aktifkan_notifikasi_email: zod_1.z.boolean().optional(),
    aktifkan_payment_gateway: zod_1.z.boolean().optional(),
    max_upload_file_size_mb: zod_1.z.number().int().positive().optional()
});
const validateRegister = (req, res, next) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateRegister = validateRegister;
const validateStudentUpdate = (req, res, next) => {
    const result = studentUpdateSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateStudentUpdate = validateStudentUpdate;
const validateBlockStudent = (req, res, next) => {
    const result = blockStudentSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateBlockStudent = validateBlockStudent;
const validateInvoice = (req, res, next) => {
    const result = invoiceSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateInvoice = validateInvoice;
const validateMassInvoice = (req, res, next) => {
    const result = massInvoiceSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateMassInvoice = validateMassInvoice;
const validateRegistration = (req, res, next) => {
    const result = registrationSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateRegistration = validateRegistration;
const validateRejectRegistration = (req, res, next) => {
    const result = rejectRegistrationSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateRejectRegistration = validateRejectRegistration;
const validateUpdateStudentStatus = (req, res, next) => {
    const result = updateStudentStatusSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateUpdateStudentStatus = validateUpdateStudentStatus;
const validateSystemConfig = (req, res, next) => {
    const result = systemConfigSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ status: "error", message: "Validation failed", errors: result.error.flatten().fieldErrors });
        return;
    }
    next();
};
exports.validateSystemConfig = validateSystemConfig;
//# sourceMappingURL=validator.middleware.js.map