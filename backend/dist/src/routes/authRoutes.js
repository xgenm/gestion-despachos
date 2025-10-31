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
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
// Usuario de prueba para desarrollo
const devUser = {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin' // Por defecto, el usuario de desarrollo es admin
};
// Almacenamiento simulado de usuarios en desarrollo
let devUsers = [devUser];
let nextDevUserId = 2;
// Registro de administrador (solo para crear el primer usuario)
router.post('/register', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username, password, role = 'employee' } = req.body;
        const createdBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // ID del usuario que está creando este empleado
        // Validación básica
        if (!username || !password) {
            return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
        }
        // Validar rol
        if (role !== 'admin' && role !== 'employee') {
            return res.status(400).json({ error: 'Rol inválido. Debe ser "admin" o "employee"' });
        }
        // Verificar si la autenticación está deshabilitada para desarrollo
        const disableAuth = process.env.DISABLE_AUTH === 'true';
        if (disableAuth) {
            // En modo desarrollo sin base de datos, crear un usuario simulado
            // Verificar si el usuario ya existe
            const existingUser = devUsers.find(u => u.username === username);
            if (existingUser) {
                return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
            }
            const user = { id: nextDevUserId++, username, password, role };
            devUsers.push(user);
            // Generar token
            const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '24h' });
            return res.status(201).json({
                message: 'Usuario creado exitosamente (modo desarrollo)',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        }
        // Verificar si el usuario ya existe (en modo con BD real)
        const existingUser = yield User_1.UserModel.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }
        // Crear nuevo usuario con el campo created_by
        const user = yield User_1.UserModel.createUser(username, password, role, createdBy);
        // Generar token
        const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '24h' });
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                created_by: user.created_by
            }
        });
    }
    catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Obtener lista de usuarios
router.get('/users', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const disableAuth = process.env.DISABLE_AUTH === 'true';
        if (disableAuth) {
            // En modo desarrollo, retornar lista de usuarios simulados
            const users = devUsers.map(u => ({
                id: u.id,
                username: u.username,
                role: u.role
            }));
            return res.json(users);
        }
        // En modo con BD real, obtener todos los usuarios
        const users = yield User_1.UserModel.getAllUsers();
        const usersResponse = users.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            created_by: u.created_by,
            created_at: u.created_at
        }));
        res.json(usersResponse);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Eliminar usuario
router.delete('/users/:id', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validar que no se pueda auto-eliminar
        if (userId === currentUserId) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }
        const disableAuth = process.env.DISABLE_AUTH === 'true';
        if (disableAuth) {
            // En modo desarrollo, eliminar usuario simulado
            const userIndex = devUsers.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            // No permitir eliminar al admin principal
            if (devUsers[userIndex].id === 1) {
                return res.status(400).json({ error: 'No se puede eliminar el usuario administrador principal' });
            }
            devUsers.splice(userIndex, 1);
            return res.json({ message: 'Usuario eliminado exitosamente' });
        }
        // En modo con BD real, eliminar usuario
        const deleted = yield User_1.UserModel.deleteUser(userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Inicio de sesión
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Validación básica
        if (!username || !password) {
            return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
        }
        // Verificar si la autenticación está deshabilitada para desarrollo
        const disableAuth = process.env.DISABLE_AUTH === 'true';
        if (disableAuth) {
            // En modo desarrollo sin base de datos, buscar usuario en la lista de desarrollo
            const user = devUsers.find(u => u.username === username);
            if (user && user.password === password) {
                // Generar token
                const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
                const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '24h' });
                return res.json({
                    message: 'Inicio de sesión exitoso (modo desarrollo)',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    }
                });
            }
            else {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        }
        // Buscar usuario
        const user = yield User_1.UserModel.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Validar contraseña
        const isValidPassword = yield User_1.UserModel.validatePassword(user, password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        // Generar token
        const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '24h' });
        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map