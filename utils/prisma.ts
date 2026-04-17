import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

// Panggil supir dari pg
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Kasih supirnya ke Prisma
const prisma = new PrismaClient({ adapter });

export { prisma };