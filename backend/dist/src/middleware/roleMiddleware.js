"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        // Verificar si la autenticación está deshabilitada para desarrollo
        const disableAuth = process.env.DISABLE_AUTH === 'true';
        if (disableAuth) {
            // En modo desarrollo, permitir acceso
            console.log('Autenticación deshabilitada para desarrollo');
            req.user = { id: 1, username: 'dev_user', role: 'admin' };
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
            // Verificar si el usuario tiene el rol requerido
            if (requiredRole === 'admin' && decoded.role !== 'admin') {
                return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
            }
            next();
        }
        catch (error) {
            return res.status(403).json({ error: 'Token inválido.' });
        }
    };
};
exports.default = checkRole;
//# sourceMappingURL=roleMiddleware.js.map