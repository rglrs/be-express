"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const system_config_controller_1 = require("../controllers/system-config.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = (0, express_1.Router)();
// Public - anyone can view config
router.get('/', system_config_controller_1.getConfig);
// Admin - only admin can update config
router.put('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, validator_middleware_1.validateSystemConfig, system_config_controller_1.updateConfig);
exports.default = router;
//# sourceMappingURL=system-config.routes.js.map