import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import invoiceRoutes from './routes/invoice.routes';
import adminRoutes from './routes/admin.routes';
import registrationRoutes from './routes/registration.routes';
import systemConfigRoutes from './routes/system-config.routes';
import auditRoutes from './routes/audit.routes';
import informasiRoutes from './routes/informasi.route';
import masterRoutes from './routes/master.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send("Backend Server is Running!");
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/system-config', systemConfigRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/informasi', informasiRoutes);
app.use('/api/master', masterRoutes);

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

export default app;