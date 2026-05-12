"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = (0, express_1.Router)();
// Public - Get all students (admin only)
router.get('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, student_controller_1.getStudents);
// Student dashboard - personal
router.get('/dashboard/personal', auth_middleware_1.verifyToken, auth_middleware_1.isStudent, student_controller_1.getStudentDashboard);
// Student invoice summary
router.get('/invoices/summary', auth_middleware_1.verifyToken, auth_middleware_1.isStudent, student_controller_1.getStudentInvoiceSummary);
// Get student by ID
router.get('/:id', auth_middleware_1.verifyToken, student_controller_1.getStudentById);
// Update student
router.put('/:id', auth_middleware_1.verifyToken, validator_middleware_1.validateStudentUpdate, student_controller_1.updateStudent);
// Delete student (admin only)
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, student_controller_1.deleteStudent);
exports.default = router;
//# sourceMappingURL=student.routes.js.map