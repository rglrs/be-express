"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStudent = void 0;
const zod_1 = require("zod");
const studentSchema = zod_1.z.object({
    nisn: zod_1.z.string().min(5, "NISN must be at least 5 characters long"),
    nama_lengkap: zod_1.z.string().min(3, "Name must be at least 3 characters long"),
    kelas: zod_1.z.string().min(2, "Class field is required"),
    user_id: zod_1.z.string().min(1, "User ID is required")
});
const validateStudent = (req, res, next) => {
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
exports.validateStudent = validateStudent;
//# sourceMappingURL=student.validator.js.map