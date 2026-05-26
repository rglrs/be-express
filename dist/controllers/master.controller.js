"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAcademicYear = exports.toggleAcademicYear = exports.createAcademicYear = exports.deleteGrade = exports.createGrade = exports.deleteMajor = exports.createMajor = exports.getPublicMajors = exports.getMasterData = void 0;
const prisma_1 = require("../utils/prisma");
const getMasterData = async (req, res) => {
    try {
        const [majors, grades, years] = await Promise.all([
            prisma_1.prisma.major.findMany({ orderBy: { name: 'asc' } }),
            prisma_1.prisma.grade.findMany({ orderBy: { name: 'asc' } }),
            prisma_1.prisma.academicYear.findMany({ orderBy: { year: 'desc' } })
        ]);
        res.json({ status: "success", data: { majors, grades, years } });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getMasterData = getMasterData;
const getPublicMajors = async (req, res) => {
    try {
        const majors = await prisma_1.prisma.major.findMany({ orderBy: { name: 'asc' } });
        res.json({ status: "success", data: majors });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal memuat daftar jurusan" });
    }
};
exports.getPublicMajors = getPublicMajors;
const createMajor = async (req, res) => {
    try {
        const name = req.body.name;
        const data = await prisma_1.prisma.major.create({ data: { name } });
        res.status(201).json({ status: "success", data });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menambah jurusan" });
    }
};
exports.createMajor = createMajor;
const deleteMajor = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.major.delete({ where: { id } });
        res.json({ status: "success", message: "Jurusan dihapus" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghapus jurusan" });
    }
};
exports.deleteMajor = deleteMajor;
const createGrade = async (req, res) => {
    try {
        const name = req.body.name;
        const data = await prisma_1.prisma.grade.create({ data: { name } });
        res.status(201).json({ status: "success", data });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menambah kelas" });
    }
};
exports.createGrade = createGrade;
const deleteGrade = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.grade.delete({ where: { id } });
        res.json({ status: "success", message: "Kelas dihapus" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghapus kelas" });
    }
};
exports.deleteGrade = deleteGrade;
const createAcademicYear = async (req, res) => {
    try {
        const year = req.body.year;
        const data = await prisma_1.prisma.academicYear.create({ data: { year, is_active: false } });
        res.status(201).json({ status: "success", data });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menambah tahun ajaran" });
    }
};
exports.createAcademicYear = createAcademicYear;
const toggleAcademicYear = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.academicYear.updateMany({ data: { is_active: false } }),
            prisma_1.prisma.academicYear.update({ where: { id }, data: { is_active: true } })
        ]);
        res.json({ status: "success", message: "Tahun ajaran aktif diperbarui" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal memperbarui status" });
    }
};
exports.toggleAcademicYear = toggleAcademicYear;
const deleteAcademicYear = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.academicYear.delete({ where: { id } });
        res.json({ status: "success", message: "Tahun ajaran dihapus" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Gagal menghapus tahun ajaran" });
    }
};
exports.deleteAcademicYear = deleteAcademicYear;
//# sourceMappingURL=master.controller.js.map