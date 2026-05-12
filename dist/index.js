"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const registration_routes_1 = __importDefault(require("./routes/registration.routes"));
const system_config_routes_1 = __importDefault(require("./routes/system-config.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Untuk testing apakah backend menyala di Vercel
app.get('/', (req, res) => {
    res.send("Backend Server is Running!");
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/registrations', registration_routes_1.default);
app.use('/api/config', system_config_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
// Jalankan app.listen HANYA jika bukan di Vercel (production)
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
// WAJIB untuk Vercel: export app
exports.default = app;
//# sourceMappingURL=index.js.map