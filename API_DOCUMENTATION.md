# API Documentation - School Payment Management System

## Base URL
```
http://localhost:3000/api
```

## Authentication
Semua endpoint (kecuali yang ditandai public) memerlukan header Authorization:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### 1. Register Student
**POST** `/auth/register`
**Visibility:** Public

Request Body:
```json
{
  "email": "student@example.com",
  "password": "password123",
  "nisn": "1234567890",
  "nama_lengkap": "John Doe",
  "kelas": "10"
}
```

Response (201):
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "id": "user_id",
    "email": "student@example.com",
    "student": { ... }
  }
}
```

### 2. Login
**POST** `/auth/login`
**Visibility:** Public

Request Body:
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": "user_id",
    "email": "student@example.com",
    "role": "STUDENT",
    "token": "jwt_token_here"
  }
}
```

---

## Student Endpoints

### 1. Get All Students (Admin Only)
**GET** `/students`
**Authorization:** Admin
**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `search` (string, search by name/NISN)
- `kelas` (string)
- `status` (string, AKTIF/UNDUR_DIRI/KELUAR)

Response (200):
```json
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total_data": 50,
    "total_pages": 5
  }
}
```

### 2. Get Student Personal Dashboard
**GET** `/students/dashboard/personal`
**Authorization:** Student only

Response (200):
```json
{
  "status": "success",
  "data": {
    "student_info": {
      "id": "...",
      "nama": "John Doe",
      "nisn": "1234567890",
      "kelas": "10",
      "status": "AKTIF",
      "blokir_ujian": false
    },
    "finansial": {
      "total_invoices": 5,
      "paid_invoices": 3,
      "pending_invoices": 1,
      "overdue_invoices": 1,
      "total_nominal": 5000000,
      "total_paid": 3000000,
      "total_unpaid": 2000000
    }
  }
}
```

### 3. Get Student Invoice Summary
**GET** `/students/invoices/summary`
**Authorization:** Student only

Response (200):
```json
{
  "status": "success",
  "data": {
    "invoices": [ ... ],
    "summary": {
      "total_invoices": 5,
      "by_status": { "pending": 1, "paid": 3, "overdue": 1 },
      "by_type": { "spp": 2, "du": 1, "buku": 1, "seragam": 1, "lainnya": 0 }
    }
  }
}
```

### 4. Get Student By ID
**GET** `/students/:id`
**Authorization:** Student (own data) or Admin

Response (200):
```json
{
  "status": "success",
  "data": { ... student data ... }
}
```

### 5. Update Student
**PUT** `/students/:id`
**Authorization:** Admin

Request Body:
```json
{
  "nama_lengkap": "Jane Doe",
  "kelas": "11",
  "jurusan": "IPA"
}
```

### 6. Delete Student
**DELETE** `/students/:id`
**Authorization:** Admin only

---

## Invoice Endpoints

### 1. Get All Invoices
**GET** `/invoices`
**Authorization:** Required
- Student: sees only their own
- Admin: sees all

Query Parameters:
- `page` (int, default: 1)
- `limit` (int, default: 10)

### 2. Get Invoice By ID
**GET** `/invoices/:id`
**Authorization:** Required

### 3. Get Invoices By Student
**GET** `/invoices/student/:student_id`
**Authorization:** Admin only

Query Parameters:
- `page` (int, default: 1)
- `limit` (int, default: 10)

### 4. Get Financial Summary
**GET** `/invoices/summary/financial`
**Authorization:** Admin only

Query Parameters:
- `month` (int, 1-12, default: current month)
- `year` (int, default: current year)

Response (200):
```json
{
  "status": "success",
  "data": {
    "month": 5,
    "year": 2026,
    "total_tagihan": 50000000,
    "total_terbayar": 30000000,
    "total_overdue": 5000000,
    "total_pending": 15000000
  }
}
```

### 5. Create Invoice
**POST** `/invoices`
**Authorization:** Admin only

Request Body:
```json
{
  "student_id": "uuid",
  "judul_tagihan": "SPP Bulan Mei",
  "jenis_tagihan": "SPP",
  "bulan": "05",
  "nominal": 500000,
  "tanggal_jatuh_tempo": "2026-05-30T23:59:59Z"
}
```

### 6. Create Mass Invoices
**POST** `/invoices/massal/create`
**Authorization:** Admin only

Request Body:
```json
{
  "targetKelas": "10",
  "judul_tagihan": "SPP Bulan Mei",
  "bulan": "05",
  "nominal": 500000
}
```

### 7. Update Invoice
**PUT** `/invoices/:id`
**Authorization:** Admin only
**Note:** Can only update if status is PENDING

### 8. Delete Invoice
**DELETE** `/invoices/:id`
**Authorization:** Admin only
**Note:** Can only delete if status is PENDING

### 9. Pay Invoice (Create Payment Transaction)
**POST** `/invoices/:id/pay`
**Authorization:** Student (own invoice) or Admin

Response (200):
```json
{
  "status": "success",
  "data": {
    "token": "snap_token_from_midtrans"
  }
}
```

### 10. Midtrans Callback
**POST** `/invoices/callback`
**Visibility:** Public (Midtrans webhook)

---

## Registration Endpoints

### 1. Get All Registrations
**GET** `/registrations`
**Authorization:** Admin only

Query Parameters:
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `status` (string, PENDING/ACCEPTED/REJECTED)

### 2. Get Registration By ID
**GET** `/registrations/:id`
**Authorization:** Admin only

### 3. Create Registration (Self-Service)
**POST** `/registrations`
**Visibility:** Public

Request Body:
```json
{
  "nama_lengkap": "Jane Doe",
  "nisn": "1234567890",
  "email": "jane@example.com",
  "jurusan": "IPA",
  "nama_orang_tua": "Mr. Doe",
  "hp_orang_tua": "08123456789",
  "berkas_url": "https://..."
}
```

### 4. Update Registration
**PATCH** `/registrations/:id`
**Visibility:** Public
**Note:** Can only update if status is PENDING

### 5. Accept Registration
**POST** `/registrations/:id/accept`
**Authorization:** Admin only

Request Body:
```json
{
  "password": "password123"
}
```

Response (200):
```json
{
  "status": "success",
  "message": "Registration accepted successfully",
  "data": { ... registration with ACCEPTED status ... }
}
```

### 6. Reject Registration
**POST** `/registrations/:id/reject`
**Authorization:** Admin only

Request Body:
```json
{
  "alasan": "NISN tidak valid"
}
```

---

## Admin Endpoints

### 1. Get Dashboard Statistics
**GET** `/admin/dashboard/stats`
**Authorization:** Admin only

Response (200):
```json
{
  "status": "success",
  "data": {
    "students": { "total": 500, "blocked": 10 },
    "invoices": {
      "total": 2000,
      "paid": 1500,
      "overdue": 100,
      "total_nominal": 1000000000,
      "total_paid": 750000000,
      "total_unpaid": 250000000
    },
    "registrations": { "pending": 20, "accepted": 100, "rejected": 5 }
  }
}
```

### 2. Block Student
**POST** `/admin/students/:student_id/block`
**Authorization:** Admin only

Request Body:
```json
{
  "alasan_blokir": "Tunggakan lebih dari 3 bulan"
}
```

### 3. Unblock Student
**POST** `/admin/students/:student_id/unblock`
**Authorization:** Admin only

### 4. Update Student Status
**PATCH** `/admin/students/:student_id/status`
**Authorization:** Admin only

Request Body:
```json
{
  "status": "UNDUR_DIRI"
}
```

Valid status: AKTIF, UNDUR_DIRI, KELUAR

### 5. Verify Transaction
**POST** `/admin/transactions/:transaction_id/verify`
**Authorization:** Admin only
**Note:** For manual payment verification

### 6. Reject Transaction
**POST** `/admin/transactions/:transaction_id/reject`
**Authorization:** Admin only

Request Body:
```json
{
  "alasan": "Bukti tidak jelas"
}
```

---

## System Configuration Endpoints

### 1. Get System Configuration
**GET** `/config`
**Visibility:** Public

Response (200):
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "batas_hari_jatuh_tempo": 30,
    "batas_hari_tunggakan": 90,
    "persentase_denda_per_hari": 0.5,
    "email_reminder_hari_ke": 7,
    "aktifkan_notifikasi_email": true,
    "aktifkan_payment_gateway": true,
    "max_upload_file_size_mb": 10
  }
}
```

### 2. Update System Configuration
**PUT** `/config`
**Authorization:** Admin only

Request Body:
```json
{
  "batas_hari_jatuh_tempo": 35,
  "batas_hari_tunggakan": 90,
  "persentase_denda_per_hari": 0.75
}
```

---

## Audit Log Endpoints

### 1. Get All Audit Logs
**GET** `/audit`
**Authorization:** Admin only

Query Parameters:
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `entity_type` (string)
- `aksi` (string)
- `admin_id` (string)

### 2. Get Audit Log Detail
**GET** `/audit/:id`
**Authorization:** Admin only

### 3. Get Audit Logs By Student
**GET** `/audit/student/:student_id`
**Authorization:** Admin only

### 4. Get Audit Logs By Admin
**GET** `/audit/admin/:admin_id`
**Authorization:** Admin only

---

## Response Format

### Success Response (2xx)
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response (4xx, 5xx)
```json
{
  "status": "error",
  "message": "Error description",
  "errors": { ... } // Validation errors if any
}
```

---

## HTTP Status Codes
- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Internal Server Error

---

## Error Codes & Messages

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Validation failed |
| 400 | ALREADY_EXISTS | Resource already exists |
| 400 | INVALID_STATUS | Invalid status value |
| 401 | UNAUTHORIZED | Unauthorized access |
| 403 | FORBIDDEN | Forbidden: Admin access required |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_ERROR | Internal server error |
