"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStudent = exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ status: "error", message: "Unauthorized access" });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ status: "error", message: "Token not found" });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secret || 'secret');
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        req.ipAddress = (req.ip || req.socket?.remoteAddress || req.headers['x-forwarded-for']);
        req.userAgent = req.get('user-agent');
        next();
    }
    catch (error) {
        res.status(401).json({ status: "error", message: "Invalid or expired token" });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    }
    else {
        res.status(403).json({ status: "error", message: "Forbidden: Admin access required" });
    }
};
exports.isAdmin = isAdmin;
const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'STUDENT') {
        next();
    }
    else {
        res.status(403).json({ status: "error", message: "Forbidden: Student access required" });
    }
};
exports.isStudent = isStudent;
//# sourceMappingURL=auth.middleware.js.map