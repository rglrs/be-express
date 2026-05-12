import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAllBroadcasts = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.broadcast.findMany({ orderBy: { tanggal: 'desc' } });
        res.json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createBroadcast = async (req: Request, res: Response): Promise<void> => {
    try {
        // Melakukan type-casting eksplisit agar TypeScript tidak mendeteksi sebagai string[] atau undefined
        const judul = req.body.judul as string;
        const pesan = req.body.pesan as string;
        const tipe = req.body.tipe ? (req.body.tipe as string) : 'Informasi';

        const data = await prisma.broadcast.create({
            data: { 
                judul, 
                pesan, 
                tipe 
            }
        });
        res.status(201).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const deleteBroadcast = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.broadcast.delete({ where: { id } });
        res.json({ status: "success", message: "Pengumuman berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getAllKalender = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.kalender.findMany({ orderBy: { tanggal: 'asc' } });
        res.json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createKalender = async (req: Request, res: Response): Promise<void> => {
    try {
        // Mencegah nilai undefined masuk ke Prisma dengan mengubahnya menjadi null secara eksplisit
        const judul = req.body.judul as string;
        const deskripsi = req.body.deskripsi ? (req.body.deskripsi as string) : null;
        const tipe = req.body.tipe ? (req.body.tipe as string) : 'Akademik';
        const tanggal = req.body.tanggal as string;

        const data = await prisma.kalender.create({
            data: { 
                judul, 
                deskripsi, 
                tipe, 
                tanggal: new Date(tanggal) 
            }
        });
        res.status(201).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const deleteKalender = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.kalender.delete({ where: { id } });
        res.json({ status: "success", message: "Agenda berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};