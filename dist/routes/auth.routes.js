"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const email_controller_1 = require("../controllers/email.controller");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = (0, express_1.Router)();
router.post('/register', validator_middleware_1.validateRegister, auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/register-ppdb', email_controller_1.kirimEmailPPDB);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map