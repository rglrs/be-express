import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { kirimEmailTunggakan } from '../controllers/email.controller';

export const initCronJobs = (): void => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const config = await prisma.systemConfig.findFirst();
            if (!config) return;

            const today = new Date();

            const pendingInvoices = await prisma.invoice.findMany({
                where: {
                    status: 'PENDING',
                    tanggal_jatuh_tempo: { lt: today }
                }
            });

            for (const invoice of pendingInvoices) {
                const newNominal = Math.round(invoice.nominal * (1 + config.persentase_denda_per_hari / 100));
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { 
                        status: 'OVERDUE',
                        nominal: newNominal 
                    }
                });
            }

            const overdueInvoices = await prisma.invoice.findMany({
                where: { status: 'OVERDUE' }
            });

            for (const invoice of overdueInvoices) {
                const newNominal = Math.round(invoice.nominal * (1 + config.persentase_denda_per_hari / 100));
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { nominal: newNominal }
                });

                if (config.aktifkan_notifikasi_email && invoice.tanggal_jatuh_tempo) {
                    const diffTime = Math.abs(today.getTime() - invoice.tanggal_jatuh_tempo.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === config.email_reminder_hari_ke) {
                        await kirimEmailTunggakan(invoice.id);
                    }
                }
            }
        } catch (error) {}
    });
};