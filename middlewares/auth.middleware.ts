import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ==========================================
// SATPAM 1: Pengecek Token KTP (verifyToken)
// ==========================================
export const verifyToken = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: "error", message: "Hayo, tiket masuknya (Token) mana?" });
  }

  const token = authHeader.split(' ')[1] as string;

  try {
    const secret = process.env.JWT_SECRET || 'rahasiabanged';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Tiketnya palsu atau udah kadaluarsa nih!" });
  }
}; // <-- Nah, tutupnya verifyToken di sini ya Bos!

// ==========================================
// SATPAM 2: Komandan Pengecek Admin (isAdmin)
// ==========================================
export const isAdmin = (req: Request, res: Response, next: NextFunction): any => {
  // Ambil data diri dari tiket yang udah dicek sama verifyToken tadi
  const user = (req as any).user;

  // Cek apakah di tiketnya ada tulisan role "ADMIN" (atau "admin", sesuaikan sama database)
  if (user && user.role === 'ADMIN') {
    next(); // Silakan lewat, Paduka Admin! 👑
  } else {
    // Kalau rolenya "USER" atau kosong, tendang!
    return res.status(403).json({ 
      status: "error", 
      message: "Akses Ditolak! Cuma Admin yang boleh ngacak-ngacak data ini 🛑" 
    });
  }
};