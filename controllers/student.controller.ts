import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const search = typeof req.query.search === 'string' ? req.query.search : "";
        const skip = (page - 1) * limit;

        const students = await prisma.student.findMany({
            skip,
            take: limit,
            where: {
                nama_lengkap: {
                    contains: search,
                    mode: 'insensitive'
                }
            },
            include: { user: { select: { email: true, role: true } } }
        });

        const totalData = await prisma.student.count({
            where: {
                nama_lengkap: {
                    contains: search,
                    mode: 'insensitive'
                }
            }
        });

        res.status(200).json({
            status: "success",
            data: students,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: totalData,
                total_pages: Math.ceil(totalData / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const student = await prisma.student.findUnique({
            where: { id: String(id) },
            include: { user: { select: { email: true } }, invoices: true }
        });

        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        res.status(200).json({ status: "success", data: student });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { nisn, nama_lengkap, kelas } = req.body;
        
        const updatedStudent = await prisma.student.update({
            where: { id: String(id) },
            data: { 
                nisn: nisn ?? undefined, 
                nama_lengkap: nama_lengkap ?? undefined, 
                kelas: kelas ?? undefined 
            }
        });

        res.status(200).json({ status: "success", message: "Student updated", data: updatedStudent });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.student.delete({
            where: { id: String(id) }
        });
        res.status(200).json({ status: "success", message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};