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
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
// GET all users
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.default.connect();
    try {
        const result = yield client.query("SELECT * FROM users");
        res.json({ data: result.rows });
    }
    catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
    }
    finally {
        client.release();
    }
}));
// POST new user
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    // Validación básica
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nombre de usuario es requerido' });
    }
    const client = yield database_1.default.connect();
    try {
        const result = yield client.query("INSERT INTO users (name) VALUES ($1) RETURNING id, name", [name.trim()]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error al crear usuario:', err);
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('duplicate key')) {
            return res.status(400).json({ error: 'El nombre de usuario ya existe' });
        }
        res.status(500).json({ error: 'Error al crear usuario', details: err.message });
    }
    finally {
        client.release();
    }
}));
// DELETE user
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    // Validación de ID
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }
    const client = yield database_1.default.connect();
    try {
        const result = yield client.query("DELETE FROM users WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    }
    catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
    }
    finally {
        client.release();
    }
}));
exports.default = router;
