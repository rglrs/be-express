import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  prisma from '../utils/prisma'; // <-- Pinjem mesin dari folder utils!

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "Email sudah ada" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        role: role || 'STUDENT',
      },
      select: { id: true, email: true, role: true },
    });

    return res.status(201).json({ status: "success", message: "Register Berhasil!", data: user });

  } catch (error) {
    console.error("INI ERRORNYA BES:", error);
    return res.status(500).json({ status: "error", message: "Server lagi pusing" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ status: "error", message: "Email/Password salah" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Email/Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'rahasiabanged',
      { expiresIn: '1d' }
    );

    return res.json({ status: "success", message: "Login Berhasil!", data: { token, user: { id: user.id, email: user.email, role: user.role } } });

  } catch (error) {
    console.error("INI ERRORNYA BES:", error);
    return res.status(500).json({ status: "error", message: "Server lagi pusing" });
  }
};