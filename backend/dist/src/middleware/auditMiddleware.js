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
exports.logManualAction = exports.auditLog = void 0;
const AuditLog_1 = require("../models/AuditLog");
const auditLog = (entityType) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const originalSend = res.json.bind(res);
        res.json = function (body) {
            // Solo registrar si la operación fue exitosa (código 2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const action = req.method === 'POST' ? 'CREATE' :
                    req.method === 'PUT' || req.method === 'PATCH' ? 'UPDATE' :
                        req.method === 'DELETE' ? 'DELETE' : 'READ';
                const user = req.user;
                const entityId = req.params.id ? parseInt(req.params.id) : body === null || body === void 0 ? void 0 : body.id;
                const ipAddress = req.ip || req.socket.remoteAddress;
                // Guardar detalles relevantes según la acción
                let details = {};
                if (action === 'CREATE' || action === 'UPDATE') {
                    details = Object.assign({}, req.body);
                    // Eliminar información sensible
                    delete details.password;
                }
                else if (action === 'DELETE') {
                    details = { deletedId: entityId };
                }
                // Registrar en segundo plano (no bloquear la respuesta)
                if (user) {
                    AuditLog_1.AuditLogModel.log(user.id, user.username, action, entityType, entityId, details, ipAddress).catch(err => console.error('Error al registrar auditoría:', err));
                }
            }
            return originalSend(body);
        };
        next();
    });
};
exports.auditLog = auditLog;
const logManualAction = (userId, username, action, entityType, entityId, details, req) => __awaiter(void 0, void 0, void 0, function* () {
    const ipAddress = req ? (req.ip || req.socket.remoteAddress) : undefined;
    yield AuditLog_1.AuditLogModel.log(userId, username, action, entityType, entityId, details, ipAddress);
});
exports.logManualAction = logManualAction;
//# sourceMappingURL=auditMiddleware.js.map