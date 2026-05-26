"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKalender = exports.createKalender = exports.getAllKalender = exports.deleteBroadcast = exports.createBroadcast = exports.getAllBroadcasts = void 0;
const prisma_1 = require("../utils/prisma");
const getAllBroadcasts = async (req, res) => {
    try {
        const data = await prisma_1.prisma.broadcast.findMany({ orderBy: { tanggal: 'desc' } });
        res.json({ status: "success", data });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAllBroadcasts = getAllBroadcasts;
const createBroadcast = async (req, res) => {
    try {
        // Melakukan type-casting eksplisit agar TypeScript tidak mendeteksi sebagai string[] atau undefined
        const judul = req.body.judul;
        const pesan = req.body.pesan;
        const tipe = req.body.tipe ? req.body.tipe : 'Informasi';
        const data = await prisma_1.prisma.broadcast.create({
            data: {
                judul,
                pesan,
                tipe
            }
        });
        res.status(201).json({ status: "success", data });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.createBroadcast = createBroadcast;
const deleteBroadcast = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.broadcast.delete({ where: { id } });
        res.json({ status: "success", message: "Pengumuman berhasil dihapus" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.deleteBroadcast = deleteBroadcast;
const getAllKalender = async (req, res) => {
    try {
        const data = await prisma_1.prisma.kalender.findMany({ orderBy: { tanggal: 'asc' } });
        res.json({ status: "success", data });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAllKalender = getAllKalender;
const createKalender = async (req, res) => {
    try {
        // Mencegah nilai undefined masuk ke Prisma dengan mengubahnya menjadi null secara eksplisit
        const judul = req.body.judul;
        const deskripsi = req.body.deskripsi ? req.body.deskripsi : null;
        const tipe = req.body.tipe ? req.body.tipe : 'Akademik';
        const tanggal = req.body.tanggal;
        const data = await prisma_1.prisma.kalender.create({
            data: {
                judul,
                deskripsi,
                tipe,
                tanggal: new Date(tanggal)
            }
        });
        res.status(201).json({ status: "success", data });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.createKalender = createKalender;
const deleteKalender = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.kalender.delete({ where: { id } });
        res.json({ status: "success", message: "Agenda berhasil dihapus" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.deleteKalender = deleteKalender;
//# sourceMappingURL=informasi.controller.js.map