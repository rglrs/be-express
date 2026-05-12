"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfig = exports.getConfig = void 0;
const prisma_1 = require("../utils/prisma");
const getConfig = async (req, res) => {
    try {
        let config = await prisma_1.prisma.systemConfig.findFirst();
        if (!config) {
            config = await prisma_1.prisma.systemConfig.create({
                data: {
                    batas_hari_jatuh_tempo: 30,
                    batas_hari_tunggakan: 90,
                    persentase_denda_per_hari: 0.5,
                    email_reminder_hari_ke: 7,
                    aktifkan_notifikasi_email: true,
                    aktifkan_payment_gateway: true,
                    max_upload_file_size_mb: 10
                }
            });
        }
        res.status(200).json({
            status: "success",
            data: config
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getConfig = getConfig;
const updateConfig = async (req, res) => {
    try {
        const admin_id = req.user?.id;
        const { batas_hari_jatuh_tempo, batas_hari_tunggakan, persentase_denda_per_hari, email_reminder_hari_ke, aktifkan_notifikasi_email, aktifkan_payment_gateway, max_upload_file_size_mb } = req.body;
        let config = await prisma_1.prisma.systemConfig.findFirst();
        const oldData = JSON.stringify(config);
        if (!config) {
            config = await prisma_1.prisma.systemConfig.create({
                data: {
                    batas_hari_jatuh_tempo: batas_hari_jatuh_tempo ?? 30,
                    batas_hari_tunggakan: batas_hari_tunggakan ?? 90,
                    persentase_denda_per_hari: persentase_denda_per_hari ?? 0.5,
                    email_reminder_hari_ke: email_reminder_hari_ke ?? 7,
                    aktifkan_notifikasi_email: aktifkan_notifikasi_email ?? true,
                    aktifkan_payment_gateway: aktifkan_payment_gateway ?? true,
                    max_upload_file_size_mb: max_upload_file_size_mb ?? 10,
                    updated_by: admin_id ?? null
                }
            });
        }
        else {
            config = await prisma_1.prisma.systemConfig.update({
                where: { id: config.id },
                data: {
                    batas_hari_jatuh_tempo: batas_hari_jatuh_tempo ?? config.batas_hari_jatuh_tempo,
                    batas_hari_tunggakan: batas_hari_tunggakan ?? config.batas_hari_tunggakan,
                    persentase_denda_per_hari: persentase_denda_per_hari ?? config.persentase_denda_per_hari,
                    email_reminder_hari_ke: email_reminder_hari_ke ?? config.email_reminder_hari_ke,
                    aktifkan_notifikasi_email: aktifkan_notifikasi_email ?? config.aktifkan_notifikasi_email,
                    aktifkan_payment_gateway: aktifkan_payment_gateway ?? config.aktifkan_payment_gateway,
                    max_upload_file_size_mb: max_upload_file_size_mb ?? config.max_upload_file_size_mb,
                    updated_by: admin_id ?? null
                }
            });
        }
        const newData = JSON.stringify(config);
        await prisma_1.prisma.auditLog.create({
            data: {
                admin_id,
                aksi: 'update',
                entity_type: 'system_config',
                entity_id: config.id,
                deskripsi: 'Update system configuration',
                perubahan_old: oldData,
                perubahan_new: newData,
                ip_address: req.ipAddress ?? null,
                user_agent: req.userAgent ?? null
            }
        });
        res.status(200).json({
            status: "success",
            message: "Configuration updated successfully",
            data: config
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.updateConfig = updateConfig;
//# sourceMappingURL=system-config.controller.js.map