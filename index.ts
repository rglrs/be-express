import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import invoiceRoutes from './routes/invoice.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Untuk testing apakah backend menyala di Vercel
app.get('/', (req, res) => {
    res.send("Backend Server is Running!");
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/invoices', invoiceRoutes);

// Jalankan app.listen HANYA jika bukan di Vercel (production)
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// WAJIB untuk Vercel: export app
export default app;