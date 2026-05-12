"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const email_controller_1 = require("./email.controller");
const register = async (req, res) => {
    try {
        const { email, password, nisn, nama_lengkap, kelas } = req.body;
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
            const student = await tx.student.create({
                data: {
                    user_id: user.id,
                    nisn,
                    nama_lengkap,
                    kelas
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
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
//# sourceMappingURL=auth.controller.js.map