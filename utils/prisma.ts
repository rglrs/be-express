import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // <-- Pakai Pool dari pg
import 'dotenv/config';

// Siapin jalur koneksinya
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Pasang supirnya
const adapter = new PrismaPg(pool);

// Nyalain mesin Prisma-nya
const prisma = new PrismaClient({ adapter });

export default prisma;