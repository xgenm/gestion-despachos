"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    // Verificar si la autenticación está deshabilitada para desarrollo
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        console.log('Autenticación deshabilitada para desarrollo');
        req.user = { id: 1, username: 'dev_user' };
        return next();
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token inválido.' });
    }
};
exports.default = authenticateToken;
//# sourceMappingURL=authMiddleware.js.map