"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const email_controller_1 = require("./email.controller");
const register = async (req, res) => {
    try {
        const { email, password, nisn, nama_lengkap, kelas, jurusan, angkatan, no_hp, alamat, nama_orang_tua, email_orang_tua, hp_orang_tua, email_beasiswa } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ status: "error", message: "Email already exists" });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password_hash: hashedPassword,
                    role: 'STUDENT',
                }
            });
            let orangTuaId = null;
            if (nama_orang_tua) {
                const ortu = await tx.orangTua.create({
                    data: {
                        nama_lengkap: nama_orang_tua,
                        no_hp: hp_orang_tua || null,
                        email: email_orang_tua || null
                    }
                });
                orangTuaId = ortu.id;
            }
            const student = await tx.student.create({
                data: {
                    user_id: user.id,
                    nisn,
                    nama_lengkap,
                    kelas,
                    jurusan,
                    angkatan,
                    no_hp: no_hp || null,
                    alamat: alamat || null,
                    email_orang_tua: email_orang_tua || null,
                    email_beasiswa: email_beasiswa || null,
                    orang_tua_id: orangTuaId
                }
            });
            return { user, student };
        });
        await (0, email_controller_1.kirimEmailPPDB)(email, nama_lengkap);
        res.status(201).json({
            status: "success",
            message: "Registration successful",
            data: {
                id: result.user.id,
                email: result.user.email,
                student: result.student
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { student: true }
        });
        if (!user) {
            res.status(401).json({ status: "error", message: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ status: "error", message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({
            status: "success",
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    student: user.student
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.login = login;
const changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { oldPassword, newPassword } = req.body;
        if (!userId) {
            res.status(401).json({ status: "error", message: "Unauthorized" });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ status: "error", message: "User not found" });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(oldPassword, user.password_hash);
        if (!isPasswordValid) {
            res.status(400).json({ status: "error", message: "Password lama salah" });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedPassword }
        });
        res.json({ status: "success", message: "Password berhasil diubah" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map