"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRegistration = exports.createRegistration = exports.rejectRegistration = exports.acceptRegistration = exports.getRegistrationById = exports.getAllRegistrations = void 0;
const prisma_1 = require("../utils/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getAllRegistrations = async (req, res) => {
    try {
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [registrations, total] = await Promise.all([
            prisma_1.prisma.registration.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: { id: true, user: { select: { email: true } } }
                    }
                }
            }),
            prisma_1.prisma.registration.count({ where })
        ]);
        res.status(200).json({
            status: "success",
            data: registrations,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAllRegistrations = getAllRegistrations;
const getRegistrationById = async (req, res) => {
    try {
        const id = req.params.id;
        const registration = await prisma_1.prisma.registration.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        user: { select: { email: true } },
                        nisn: true,
                        nama_lengkap: true
                    }
                }
            }
        });
        if (!registration) {
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }
        res.status(200).json({
            status: "success",
            data: registration
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getRegistrationById = getRegistrationById;
const acceptRegistration = async (req, res) => {
    try {
        const id = req.params.id;
        const { password } = req.body;
        const admin_id = req.user?.id;
        if (!password) {
            res.status(400).json({ status: "error", message: "Password is required" });
            return;
        }
        const registration = await prisma_1.prisma.registration.findUnique({ where: { id } });
        if (!registration) {
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }
        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: `Cannot accept registration with status: ${registration.status}`
            });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: registration.email,
                    password_hash: hashedPassword,
                    role: 'STUDENT'
                }
            });
            const student = await tx.student.create({
                data: {
                    user_id: user.id,
                    nisn: registration.nisn,
                    nama_lengkap: registration.nama_lengkap,
                    jurusan: registration.jurusan,
                    kelas: '10'
                }
            });
            const updatedRegistration = await tx.registration.update({
                where: { id },
                data: {
                    status: 'ACCEPTED',
                    student_id: student.id
                }
            });
            return { user, student, updatedRegistration };
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'accept',
                entity_type: 'registration',
                entity_id: id,
                deskripsi: `Accept registration untuk ${registration.nama_lengkap}`,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });
        res.status(200).json({
            status: "success",
            message: "Registration accepted successfully",
            data: result.updatedRegistration
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({
                status: "error",
                message: "Email or NISN already registered"
            });
        }
        else {
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
};
exports.acceptRegistration = acceptRegistration;
const rejectRegistration = async (req, res) => {
    try {
        const id = req.params.id;
        const { alasan } = req.body;
        const admin_id = req.user?.id;
        if (!alasan) {
            res.status(400).json({ status: "error", message: "Rejection reason is required" });
            return;
        }
        const registration = await prisma_1.prisma.registration.findUnique({ where: { id } });
        if (!registration) {
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }
        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: `Cannot reject registration with status: ${registration.status}`
            });
            return;
        }
        const updatedRegistration = await prisma_1.prisma.registration.update({
            where: { id },
            data: {
                status: 'REJECTED',
                catatan_admin: alasan
            }
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'reject',
                entity_type: 'registration',
                entity_id: id,
                deskripsi: `Reject registration untuk ${registration.nama_lengkap}: ${alasan}`,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });
        res.status(200).json({
            status: "success",
            message: "Registration rejected successfully",
            data: updatedRegistration
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.rejectRegistration = rejectRegistration;
const createRegistration = async (req, res) => {
    try {
        const { nama_lengkap, nisn, email, jurusan, nama_orang_tua, hp_orang_tua, berkas_url } = req.body;
        if (!nama_lengkap || !nisn || !email || !jurusan) {
            res.status(400).json({
                status: "error",
                message: "nama_lengkap, nisn, email, and jurusan are required"
            });
            return;
        }
        const existingRegistration = await prisma_1.prisma.registration.findFirst({
            where: {
                OR: [
                    { nisn },
                    { email }
                ]
            }
        });
        if (existingRegistration) {
            res.status(400).json({
                status: "error",
                message: "NISN or email already registered"
            });
            return;
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({
                status: "error",
                message: "Email already in use"
            });
            return;
        }
        const registration = await prisma_1.prisma.registration.create({
            data: {
                nama_lengkap,
                nisn,
                email,
                jurusan,
                nama_orang_tua,
                hp_orang_tua,
                berkas_url,
                status: 'PENDING'
            }
        });
        res.status(201).json({
            status: "success",
            message: "Registration submitted successfully",
            data: registration
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.createRegistration = createRegistration;
const updateRegistration = async (req, res) => {
    try {
        const id = req.params.id;
        const { nama_lengkap, jurusan, nama_orang_tua, hp_orang_tua, berkas_url } = req.body;
        const registration = await prisma_1.prisma.registration.findUnique({ where: { id } });
        if (!registration) {
            res.status(404).json({ status: "error", message: "Registration not found" });
            return;
        }
        if (registration.status !== 'PENDING') {
            res.status(400).json({
                status: "error",
                message: `Cannot update registration with status: ${registration.status}`
            });
            return;
        }
        const updatedRegistration = await prisma_1.prisma.registration.update({
            where: { id },
            data: {
                nama_lengkap: nama_lengkap ?? registration.nama_lengkap,
                jurusan: jurusan ?? registration.jurusan,
                nama_orang_tua: nama_orang_tua ?? registration.nama_orang_tua,
                hp_orang_tua: hp_orang_tua ?? registration.hp_orang_tua,
                berkas_url: berkas_url ?? registration.berkas_url
            }
        });
        res.status(200).json({
            status: "success",
            message: "Registration updated successfully",
            data: updatedRegistration
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.updateRegistration = updateRegistration;
//# sourceMappingURL=registration.controller.js.map