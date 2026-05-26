"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const email_controller_1 = require("../controllers/email.controller");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', validator_middleware_1.validateRegister, auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/register-ppdb', (req, res) => {
    (0, email_controller_1.kirimEmailPPDB)(req, res);
});
router.post('/change-password', auth_middleware_1.verifyToken, auth_controller_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map