"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_middleware_1.verifyToken, auth_middleware_1.isAdmin);
// Dashboard
router.get('/dashboard/stats', admin_controller_1.getDashboardStats);
// Student management
router.post('/students/:student_id/block', validator_middleware_1.validateBlockStudent, admin_controller_1.blockStudent);
router.post('/students/:student_id/unblock', admin_controller_1.unblockStudent);
router.patch('/students/:student_id/status', validator_middleware_1.validateUpdateStudentStatus, admin_controller_1.updateStudentStatus);
// Transaction verification (manual payments)
router.post('/transactions/:transaction_id/verify', admin_controller_1.verifyTransaction);
router.post('/transactions/:transaction_id/reject', validator_middleware_1.validateRejectRegistration, admin_controller_1.rejectTransaction);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map