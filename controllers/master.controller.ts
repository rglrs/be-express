import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getMasterData = async (req: Request, res: Response): Promise<void> => {
    try {
        const [majors, grades, years] = await Promise.all([
            prisma.major.findMany({ orderBy: { name: 'asc' } }),
            prisma.grade.findMany({ orderBy: { name: 'asc' } }),
            prisma.academicYear.findMany({ orderBy: { year: 'desc' } })
        ]);
        res.json({ status: "success", data: { majors, grades, years } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getPublicMajors = async (req: Request, res: Response): Promise<void> => {
    try {
        const majors = await prisma.major.findMany({ orderBy: { name: 'asc' } });
        res.json({ status: "success", data: majors });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal memuat daftar jurusan" });
    }
};

export const createMajor = async (req: Request, res: Response): Promise<void> => {
    try {
        const name = req.body.name as string;
        const data = await prisma.major.create({ data: { name } });
        res.status(201).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menambah jurusan" });
    }
};

export const deleteMajor = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.major.delete({ where: { id } });
        res.json({ status: "success", message: "Jurusan dihapus" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghapus jurusan" });
    }
};

export const createGrade = async (req: Request, res: Response): Promise<void> => {
    try {
        const name = req.body.name as string;
        const data = await prisma.grade.create({ data: { name } });
        res.status(201).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menambah kelas" });
    }
};

export const deleteGrade = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.grade.delete({ where: { id } });
        res.json({ status: "success", message: "Kelas dihapus" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghapus kelas" });
    }
};

export const createAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const year = req.body.year as string;
        const data = await prisma.academicYear.create({ data: { year, is_active: false } });
        res.status(201).json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menambah tahun ajaran" });
    }
};

export const toggleAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.$transaction([
            prisma.academicYear.updateMany({ data: { is_active: false } }),
            prisma.academicYear.update({ where: { id }, data: { is_active: true } })
        ]);
        res.json({ status: "success", message: "Tahun ajaran aktif diperbarui" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal memperbarui status" });
    }
};

export const deleteAcademicYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.academicYear.delete({ where: { id } });
        res.json({ status: "success", message: "Tahun ajaran dihapus" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghapus tahun ajaran" });
    }
};