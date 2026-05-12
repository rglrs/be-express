"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = (0, express_1.Router)();
// Public callback
router.post('/callback', invoice_controller_1.midtransCallback);
// Get all invoices (student sees only their own, admin sees all)
router.get('/', auth_middleware_1.verifyToken, invoice_controller_1.getAllInvoices);
// Get invoice by ID
router.get('/:id', auth_middleware_1.verifyToken, invoice_controller_1.getInvoiceById);
// Get invoices by student
router.get('/student/:student_id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, invoice_controller_1.getInvoicesByStudent);
// Get financial summary
router.get('/summary/financial', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, invoice_controller_1.getFinancialSummary);
// Create single invoice (admin only)
router.post('/', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, validator_middleware_1.validateInvoice, invoice_controller_1.createInvoice);
// Create mass invoices (admin only)
router.post('/massal/create', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, validator_middleware_1.validateInvoice, invoice_controller_1.createMassInvoice);
// Update invoice (admin only)
router.put('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, validator_middleware_1.validateInvoice, invoice_controller_1.updateInvoice);
// Delete invoice (admin only)
router.delete('/:id', auth_middleware_1.verifyToken, auth_middleware_1.isAdmin, invoice_controller_1.deleteInvoice);
// Pay invoice
router.post('/:id/pay', auth_middleware_1.verifyToken, invoice_controller_1.payInvoice);
exports.default = router;
//# sourceMappingURL=invoice.routes.js.map