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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModel = void 0;
const database_1 = __importDefault(require("../db/database"));
class AuditLogModel {
    static createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                yield client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          username VARCHAR(50) NOT NULL,
          action VARCHAR(20) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id INTEGER,
          details TEXT,
          ip_address VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
                // Crear índices para búsquedas rápidas
                yield client.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
      `);
            }
            finally {
                client.release();
            }
        });
    }
    static log(userId, username, action, entityType, entityId, details, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                yield client.query(`INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`, [userId, username, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress]);
            }
            finally {
                client.release();
            }
        });
    }
    static getRecentLogs() {
        return __awaiter(this, arguments, void 0, function* (limit = 100) {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`, [limit]);
                return result.rows;
            }
            finally {
                client.release();
            }
        });
    }
    static getLogsByUser(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 50) {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query(`SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limit]);
                return result.rows;
            }
            finally {
                client.release();
            }
        });
    }
    static getLogsByEntity(entityType, entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query(`SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC`, [entityType, entityId]);
                return result.rows;
            }
            finally {
                client.release();
            }
        });
    }
}
exports.AuditLogModel = AuditLogModel;
//# sourceMappingURL=AuditLog.js.map