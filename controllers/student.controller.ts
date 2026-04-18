import { Request, Response } from 'express';
import  prisma  from '../utils/prisma'; 

// 1. READ ALL (Ambil Semua Data)
export const getStudents = async (req: Request, res: Response) => {
    try {
        // 1. Ambil request dari URL (misal: ?page=1&limit=10&search=udin)
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || "";

        // 2. Hitung rumus "Lewati berapa data?" (Skip)
        const skip = (page - 1) * limit;

        // 3. Suruh Prisma nyari data sesuai pencarian dan batasan halaman
        const students = await prisma.student.findMany({
            skip: skip,
            take: limit,
            where: {
                nama_lengkap: {
                    contains: search,
                    mode: 'insensitive' // Biar huruf besar/kecil (Udin/udin) tetep ketemu
                }
            }
        });

        // 4. Hitung total semua murid (biar Frontend tahu ada berapa halaman)
        const totalData = await prisma.student.count({
            where: {
                nama_lengkap: {
                    contains: search,
                    mode: 'insensitive'
                }
            }
        });

        // 5. Kirim balasan ke Postman/Web
        res.status(200).json({
            status: "success",
            data: students,
            meta: {
                halaman_sekarang: page,
                data_per_halaman: limit,
                total_semua_data: totalData,
                total_halaman: Math.ceil(totalData / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Waduh, gagal ngambil data nih!" });
    }
};

// 2. READ ONE (Ambil 1 Data Spesifik)
export const getStudentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await prisma.student.findUnique({
            where: { id: String(id) }
        });
        if (!student) return res.status(404).json({ status: "error", message: "Siswa nggak ketemu!" });
        res.status(200).json({ status: "success", data: student });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// 3. CREATE (Tambah Data)
export const createStudent = async (req: Request, res: Response) => {
    try {
        const { nisn, nama_lengkap, kelas, user_id } = req.body;
        const newStudent = await prisma.student.create({
            data: { nisn, nama_lengkap, kelas, user_id }
        });
        res.status(201).json({ status: "success", data: newStudent });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// 4. UPDATE (Edit Data)
export const updateStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 
        const { nisn, nama_lengkap, kelas } = req.body; 
        const updatedStudent = await prisma.student.update({
            where: { id: String(id) },
            data: { nisn, nama_lengkap, kelas }
        });
        res.status(200).json({ status: "success", message: "Data diupdate!", data: updatedStudent });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// 5. DELETE (Hapus Data)
export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.student.delete({
            where: { id: String(id)}
        });
        res.status(200).json({ status: "success", message: "Data berhasil dihapus selamanya!" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};