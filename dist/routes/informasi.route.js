"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const informasi_controller_1 = require("../controllers/informasi.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/broadcast', auth_middleware_1.verifyToken, informasi_controller_1.getAllBroadcasts);
router.post('/broadcast', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, informasi_controller_1.createBroadcast);
router.delete('/broadcast/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, informasi_controller_1.deleteBroadcast);
router.get('/kalender', auth_middleware_1.verifyToken, informasi_controller_1.getAllKalender);
router.post('/kalender', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, informasi_controller_1.createKalender);
router.delete('/kalender/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, informasi_controller_1.deleteKalender);
exports.default = router;
//# sourceMappingURL=informasi.route.js.map