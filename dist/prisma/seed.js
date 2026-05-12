"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new prisma_1.PrismaClient({ adapter });
async function main() {
    const saltRounds = 10;
    const adminPassword = await bcrypt_1.default.hash('admin123', saltRounds);
    await prisma.user.upsert({
        where: { email: 'admin@sora.com' },
        update: {},
        create: {
            email: 'admin@sora.com',
            password_hash: adminPassword,
            role: 'ADMIN',
        },
    });
    const studentPassword = await bcrypt_1.default.hash('student123', saltRounds);
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
//# sourceMappingURL=seed.js.map