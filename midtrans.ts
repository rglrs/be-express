import dotenv from 'dotenv';
// @ts-ignore (Ini biar TypeScript nggak rewel nyari tipe datanya)
import midtransClient from 'midtrans-client';

dotenv.config();

// Inisialisasi Mesin Kasir Midtrans (Mode Snap untuk Pop-up UI)
export const snap = new midtransClient.Snap({
    isProduction: false, // Wajib false karena kita masih di ruang latihan (Sandbox)
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});