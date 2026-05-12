import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
        const entity_type = typeof req.query.entity_type === 'string' ? req.query.entity_type : undefined;
        const aksi = typeof req.query.aksi === 'string' ? req.query.aksi : undefined;
        const admin_id = typeof req.query.admin_id === 'string' ? req.query.admin_id : undefined;

        const skip = (page - 1) * limit;

        const where: any = {};
        if (entity_type) where.entity_type = entity_type;
        if (aksi) where.aksi = aksi;
        if (admin_id) where.admin_id = admin_id;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
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
            prisma.auditLog.count({ where })
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
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getAuditLogDetail = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const log = await prisma.auditLog.findUnique({
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
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getAuditLogsByStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const student_id = req.params.student_id as string;
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;

        const skip = (page - 1) * limit;

        const student = await prisma.student.findUnique({
            where: { id: student_id }
        });

        if (!student) {
            res.status(404).json({ status: "error", message: "Student not found" });
            return;
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: { student_id },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.auditLog.count({ where: { student_id } })
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
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getAuditLogsByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const admin_id = req.params.admin_id as string;
        const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
        const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
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
            prisma.auditLog.count({ where: { admin_id } })
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
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};