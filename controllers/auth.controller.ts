import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { kirimEmailPPDB, kirimEmailResetPassword } from './email.controller';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            email, password, nisn, nama_lengkap, kelas, jurusan, angkatan, 
            no_hp, alamat, nama_orang_tua, email_orang_tua, hp_orang_tua, email_beasiswa 
        } = req.body;
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        if (existingUser) {
            res.status(400).json({ status: "gagal", message: "Email sudah terdaftar" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
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

        await kirimEmailPPDB(email, nama_lengkap);

        res.status(201).json({ 
            status: "sukses", 
            message: "Pendaftaran berhasil", 
            data: {
                id: result.user.id,
                email: result.user.email,
                student: result.student
            } 
        });
    } catch (error) {
        res.status(500).json({ status: "gagal", message: "Terjadi kesalahan pada server" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ 
            where: { email },
            include: { student: true }
        });
        
        if (!user) {
            res.status(401).json({ status: "gagal", message: "Kredensial tidak valid" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ status: "gagal", message: "Kredensial tidak valid" });
            return;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.json({ 
            status: "sukses", 
            message: "Login berhasil", 
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
    } catch (error) {
        res.status(500).json({ status: "gagal", message: "Terjadi kesalahan pada server" });
    }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { oldPassword, newPassword } = req.body;

        if (!userId) {
            res.status(401).json({ status: "gagal", message: "Tidak diizinkan" });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (!user) {
            res.status(404).json({ status: "gagal", message: "Pengguna tidak ditemukan" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isPasswordValid) {
            res.status(400).json({ status: "gagal", message: "Password lama salah" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedPassword }
        });

        res.json({ status: "sukses", message: "Password berhasil diubah" });
    } catch (error) {
        res.status(500).json({ status: "gagal", message: "Terjadi kesalahan pada server" });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            res.status(404).json({ status: "gagal", message: "Email tidak terdaftar" });
            return;
        }

        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        await kirimEmailResetPassword(email, resetToken);

        res.json({ status: "sukses", message: "Link pemulihan telah dikirim ke email" });
    } catch (error) {
        res.status(500).json({ status: "gagal", message: "Terjadi kesalahan pada server" });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            res.status(400).json({ status: "gagal", message: "Token dan password baru wajib diisi" });
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json({ status: "gagal", message: "Password minimal 8 karakter" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: decoded.id },
            data: { password_hash: hashedPassword }
        });

        res.json({ status: "sukses", message: "Password berhasil diubah" });
    } catch (error) {
        res.status(400).json({ status: "gagal", message: "Token tidak valid atau sudah kedaluwarsa" });
    }
};