"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All audit routes require authentication and admin role
router.use(auth_middleware_1.verifyToken, auth_middleware_1.isAdmin);
// Get all audit logs
router.get('/', audit_controller_1.getAuditLogs);
// Get audit log detail
router.get('/:id', audit_controller_1.getAuditLogDetail);
// Get audit logs by student
router.get('/student/:student_id', audit_controller_1.getAuditLogsByStudent);
// Get audit logs by admin
router.get('/admin/:admin_id', audit_controller_1.getAuditLogsByAdmin);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map