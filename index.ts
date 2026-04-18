import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import studentRouter from './routes/student.routes';
import invoiceRoutes from './routes/invoice.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRouter);
app.use('/api/invoices', invoiceRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});