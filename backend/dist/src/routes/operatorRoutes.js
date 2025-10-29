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
// Almacenamiento simulado para modo desarrollo
let devOperators = [
    { id: 1, name: 'Operario 1' },
    { id: 2, name: 'Operario 2' }
];
let nextOperatorId = 3;
// GET all operators
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        return res.json({ data: devOperators });
    }
    const client = yield database_1.default.connect();
    try {
        const result = yield client.query("SELECT * FROM operators");
        res.json({ data: result.rows });
    }
    catch (err) {
        console.error('Error al obtener operarios:', err);
        res.status(500).json({ error: 'Error al obtener operarios', details: err.message });
    }
    finally {
        client.release();
    }
}));
// POST new operator
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    // Validación básica
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Nombre de operario es requerido' });
    }
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        // En modo desarrollo, agregar a lista simulada
        const newOperator = { id: nextOperatorId++, name: name.trim() };
        devOperators.push(newOperator);
        return res.json(newOperator);
    }
    const client = yield database_1.default.connect();
    try {
        const result = yield client.query("INSERT INTO operators (name) VALUES ($1) RETURNING id, name", [name.trim()]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error al crear operario:', err);
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('duplicate key')) {
            return res.status(400).json({ error: 'El nombre de operario ya existe' });
        }
        res.status(500).json({ error: 'Error al crear operario', details: err.message });
    }
    finally {
        client.release();
    }
}));
// DELETE operator
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    // Validación de ID
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        // En modo desarrollo, eliminar de lista simulada
        const index = devOperators.findIndex(o => o.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Operario no encontrado' });
        }
        devOperators.splice(index, 1);
        return res.json({ message: 'Operario eliminado correctamente' });
    }
    const client = yield database_1.default.connect();
    try {
        const result = yield client.query("DELETE FROM operators WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Operario no encontrado' });
        }
        res.json({ message: 'Operario eliminado correctamente' });
    }
    catch (err) {
        console.error('Error al eliminar operario:', err);
        res.status(500).json({ error: 'Error al eliminar operario', details: err.message });
    }
    finally {
        client.release();
    }
}));
exports.default = router;
//# sourceMappingURL=operatorRoutes.js.map