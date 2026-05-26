"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const master_controller_1 = require("../controllers/master.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/public/majors', master_controller_1.getPublicMajors);
router.get('/', auth_middleware_1.verifyToken, master_controller_1.getMasterData);
router.post('/major', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, master_controller_1.createMajor);
router.delete('/major/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, master_controller_1.deleteMajor);
router.post('/grade', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, master_controller_1.createGrade);
router.delete('/grade/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, master_controller_1.deleteGrade);
router.post('/year', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, master_controller_1.createAcademicYear);
router.patch('/year/:id/activate', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, master_controller_1.toggleAcademicYear);
router.delete('/year/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, master_controller_1.deleteAcademicYear);
exports.default = router;
//# sourceMappingURL=master.routes.js.map