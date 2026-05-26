"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registration_controller_1 = require("../controllers/registration.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = (0, express_1.Router)();
router.get('/status/check', registration_controller_1.checkRegistrationStatus);
router.post('/', validator_middleware_1.validateRegistration, registration_controller_1.createRegistration);
router.get('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, registration_controller_1.getAllRegistrations);
router.get('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, registration_controller_1.getRegistrationById);
router.put('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, registration_controller_1.updateRegistration);
router.put('/:id/accept', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, registration_controller_1.acceptRegistration);
router.put('/:id/reject', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, validator_middleware_1.validateRejectRegistration, registration_controller_1.rejectRegistration);
exports.default = router;
//# sourceMappingURL=registration.routes.js.map