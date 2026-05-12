"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSystemConfig = exports.validateUpdateStudentStatus = exports.validateRejectRegistration = exports.validateAcceptRegistration = exports.validateRegistration = exports.validateInvoice = exports.validateBlockStudent = exports.validateStudentUpdate = exports.validateRegister = void 0;
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    nisn: zod_1.z.string().min(5, "NISN must be at least 5 characters"),
    nama_lengkap: zod_1.z.string().min(3, "Name must be at least 3 characters"),
    kelas: zod_1.z.string().min(2, "Class is required")
});
const studentUpdateSchema = zod_1.z.object({
    nisn: zod_1.z.string().min(5).optional(),
    nama_lengkap: zod_1.z.string().min(3).optional(),
    kelas: zod_1.z.string().min(2).optional(),
    jurusan: zod_1.z.string().optional()
});
const blockStudentSchema = zod_1.z.object({
    alasan_blokir: zod_1.z.string().min(3, "Reason must be at least 3 characters").optional()
});
const invoiceSchema = zod_1.z.object({
    student_id: zod_1.z.string().uuid("Invalid student ID"),
    judul_tagihan: zod_1.z.string().min(3, "Invoice title must be at least 3 characters"),
    jenis_tagihan: zod_1.z.enum(['SPP', 'DU', 'BUKU', 'SERAGAM', 'LAINNYA']).optional(),
    bulan: zod_1.z.string().optional(),
    nominal: zod_1.z.number().int().positive("Nominal must be positive"),
    tanggal_jatuh_tempo: zod_1.z.string().datetime().optional()
});
const registrationSchema = zod_1.z.object({
    nama_lengkap: zod_1.z.string().min(3, "Name must be at least 3 characters"),
    nisn: zod_1.z.string().min(10, "NISN must be 10 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    jurusan: zod_1.z.string().min(2, "Jurusan is required"),
    nama_orang_tua: zod_1.z.string().min(3).optional(),
    hp_orang_tua: zod_1.z.string().optional(),
    berkas_url: zod_1.z.string().url().optional()
});
const acceptRegistrationSchema = zod_1.z.object({
    password: zod_1.z.string().min(6, "Password must be at least 6 characters")
});
const rejectRegistrationSchema = zod_1.z.object({
    alasan: zod_1.z.string().min(3, "Reason must be at least 3 characters")
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
        res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors
        });
        return;
    }
    next();
};
exports.validateRegister = validateRegister;
const validateStudentUpdate = (req, res, next) => {
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
exports.validateStudentUpdate = validateStudentUpdate;
const validateBlockStudent = (req, res, next) => {
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
exports.validateBlockStudent = validateBlockStudent;
const validateInvoice = (req, res, next) => {
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
exports.validateInvoice = validateInvoice;
const validateRegistration = (req, res, next) => {
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
exports.validateRegistration = validateRegistration;
const validateAcceptRegistration = (req, res, next) => {
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
exports.validateAcceptRegistration = validateAcceptRegistration;
const validateRejectRegistration = (req, res, next) => {
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
exports.validateRejectRegistration = validateRejectRegistration;
const validateUpdateStudentStatus = (req, res, next) => {
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
exports.validateUpdateStudentStatus = validateUpdateStudentStatus;
const validateSystemConfig = (req, res, next) => {
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
exports.validateSystemConfig = validateSystemConfig;
//# sourceMappingURL=validator.middleware.js.map