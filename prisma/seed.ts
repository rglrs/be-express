import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const saltRounds = 10;
  
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  await prisma.user.upsert({
    where: { email: 'admin@sora.com' },
    update: {},
    create: {
      email: 'admin@sora.com',
      password_hash: adminPassword,
      role: 'ADMIN',
    },
  });

  const studentPassword = await bcrypt.hash('student123', saltRounds);
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@sora.com' },
    update: {},
    create: {
      email: 'student@sora.com',
      password_hash: studentPassword,
      role: 'STUDENT',
    },
  });

  await prisma.student.upsert({
    where: { user_id: studentUser.id },
    update: {},
    create: {
      user_id: studentUser.id,
      nisn: '1234567890',
      nama_lengkap: 'Siswa Percobaan',
      kelas: '10A'
    }
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });