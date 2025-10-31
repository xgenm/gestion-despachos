"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditLog_1 = require("../models/AuditLog");
const router = (0, express_1.Router)();
// GET /api/audit/logs - Obtener logs recientes (solo admin)
router.get('/logs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = yield AuditLog_1.AuditLogModel.getRecentLogs(limit);
        res.json(logs);
    }
    catch (error) {
        console.error('Error al obtener logs de auditoría:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// GET /api/audit/user/:id - Obtener logs de un usuario específico (solo admin)
router.get('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 50;
        const logs = yield AuditLog_1.AuditLogModel.getLogsByUser(userId, limit);
        res.json(logs);
    }
    catch (error) {
        console.error('Error al obtener logs de usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// GET /api/audit/entity/:type/:id - Obtener logs de una entidad específica (solo admin)
router.get('/entity/:type/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const entityType = req.params.type;
        const entityId = parseInt(req.params.id);
        const logs = yield AuditLog_1.AuditLogModel.getLogsByEntity(entityType, entityId);
        res.json(logs);
    }
    catch (error) {
        console.error('Error al obtener logs de entidad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
exports.default = router;
//# sourceMappingURL=auditRoutes.js.map