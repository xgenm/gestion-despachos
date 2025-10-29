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
exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../db/database"));
class UserModel {
    static createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                yield client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'employee' NOT NULL
        )
      `);
            }
            finally {
                client.release();
            }
        });
    }
    static createUser(username_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (username, password, role = 'employee') {
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query('INSERT INTO admins (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, password, role', [username, hashedPassword, role]);
                return result.rows[0];
            }
            finally {
                client.release();
            }
        });
    }
    static findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query('SELECT id, username, password, role FROM admins WHERE username = $1', [username]);
                return result.rows.length > 0 ? result.rows[0] : null;
            }
            finally {
                client.release();
            }
        });
    }
    static validatePassword(user, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(password, user.password);
        });
    }
}
exports.UserModel = UserModel;
