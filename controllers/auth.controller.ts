import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { kirimEmailPPDB } from './email.controller';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, nisn, nama_lengkap, kelas } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        if (existingUser) {
            res.status(400).json({ status: "error", message: "Email already exists" });
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

        await kirimEmailPPDB(email, nama_lengkap);

        res.status(201).json({ 
            status: "success", 
            message: "Registration successful", 
            data: {
                id: result.user.id,
                email: result.user.email,
                student: result.student
            } 
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
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
            res.status(401).json({ status: "error", message: "Invalid credentials" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ status: "error", message: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

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
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};