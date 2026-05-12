"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogsByAdmin = exports.getAuditLogsByStudent = exports.getAuditLogDetail = exports.getAuditLogs = void 0;
const prisma_1 = require("../utils/prisma");
const getAuditLogs = async (req, res) => {
    try {
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const entity_type = typeof req.query.entity_type === 'string' ? req.query.entity_type : undefined;
        const aksi = typeof req.query.aksi === 'string' ? req.query.aksi : undefined;
        const admin_id = typeof req.query.admin_id === 'string' ? req.query.admin_id : undefined;
        const skip = (page - 1) * limit;
        const where = {};
        if (entity_type)
            where.entity_type = entity_type;
        if (aksi)
            where.aksi = aksi;
        if (admin_id)
            where.admin_id = admin_id;
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    student: {
                        select: { nama_lengkap: true, nisn: true }
                    }
                }
            }),
            prisma_1.prisma.auditLog.count({ where })
        ]);
        res.status(200).json({
            status: "success",
            data: logs,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAuditLogs = getAuditLogs;
const getAuditLogDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const log = await prisma_1.prisma.auditLog.findUnique({
            where: { id },
            include: {
                student: {
                    select: { nama_lengkap: true, nisn: true }
                }
            }
        });
        if (!log) {
            res.status(404).json({ status: "error", message: "Audit log not found" });
            return;
        }
        const logDetail = {
            ...log,
            perubahan_old: log.perubahan_old ? JSON.parse(log.perubahan_old) : null,
            perubahan_new: log.perubahan_new ? JSON.parse(log.perubahan_new) : null
        };
        res.status(200).json({
            status: "success",
            data: logDetail
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAuditLogDetail = getAuditLogDetail;
const getAuditLogsByStudent = async (req, res) => {
    try {
        const student_id = req.params.student_id;
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const student = await prisma_1.prisma.student.findUnique({
            where: { id: student_id }
        });
        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where: { student_id },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma_1.prisma.auditLog.count({ where: { student_id } })
        ]);
        res.status(200).json({
            status: "success",
            data: logs,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAuditLogsByStudent = getAuditLogsByStudent;
const getAuditLogsByAdmin = async (req, res) => {
    try {
        const admin_id = req.params.admin_id;
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where: { admin_id },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    student: {
                        select: { nama_lengkap: true, nisn: true }
                    }
                }
            }),
            prisma_1.prisma.auditLog.count({ where: { admin_id } })
        ]);
        res.status(200).json({
            status: "success",
            data: logs,
            meta: {
                current_page: page,
                per_page: limit,
                total_data: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getAuditLogsByAdmin = getAuditLogsByAdmin;
//# sourceMappingURL=audit.controller.js.map