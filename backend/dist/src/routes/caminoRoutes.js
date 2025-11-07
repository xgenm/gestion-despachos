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
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const roleMiddleware_1 = __importDefault(require("../middleware/roleMiddleware"));
const router = (0, express_1.Router)();
// GET /camiones?placa=XXX - Buscar camión por placa (público, sin autenticación)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { placa } = req.query;
        if (!placa) {
            return res.status(400).json({ error: 'Parámetro placa es requerido' });
        }
        console.log('🔍 Buscando camión con placa:', placa);
        const client = yield database_1.default.connect();
        try {
            // 1. Buscar primero en la tabla camiones
            const camionResult = yield client.query('SELECT id, placa, marca, color, m3, ficha FROM camiones WHERE placa = $1', [placa]);
            if (camionResult.rows.length > 0) {
                console.log('✅ Camión encontrado en tabla camiones:', camionResult.rows[0]);
                return res.json({
                    found: true,
                    data: camionResult.rows[0]
                });
            }
            // 2. Si NO existe en camiones, buscar en el último despacho con esa placa
            console.log('🔍 No encontrado en camiones, buscando en despachos...');
            const dispatchResult = yield client.query(`SELECT placa, camion as marca, color, ficha 
         FROM dispatches 
         WHERE placa = $1 
         ORDER BY fecha DESC, hora DESC 
         LIMIT 1`, [placa]);
            if (dispatchResult.rows.length > 0) {
                const dispatchData = dispatchResult.rows[0];
                console.log('✅ Datos encontrados en despacho anterior:', dispatchData);
                // Retornar datos del despacho (sin id porque no está en tabla camiones aún)
                return res.json({
                    found: true,
                    data: {
                        placa: dispatchData.placa,
                        marca: dispatchData.marca,
                        color: dispatchData.color,
                        ficha: dispatchData.ficha,
                        m3: null // No tenemos M3 en despachos antiguos
                    }
                });
            }
            // 3. No encontrado en ninguna parte
            console.log('❌ Camión no encontrado');
            return res.json({ found: false, data: null });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error al buscar camión:', error);
        res.status(500).json({ error: 'Error al buscar camión' });
    }
}));
// POST /camiones - Crear nuevo camión (empleado crea, admin puede editar después)
router.post('/', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { placa, marca, color, m3, ficha } = req.body;
        // Validación básica
        if (!placa || placa.trim() === '') {
            return res.status(400).json({ error: 'Placa es requerida' });
        }
        if (!m3 || isNaN(parseFloat(m3))) {
            return res.status(400).json({ error: 'M3 debe ser un número válido' });
        }
        const client = yield database_1.default.connect();
        try {
            // Verificar si ya existe la placa
            const checkResult = yield client.query('SELECT id FROM camiones WHERE placa = $1', [placa.toUpperCase()]);
            if (checkResult.rows.length > 0) {
                return res.status(400).json({ error: 'La placa ya existe' });
            }
            // Crear nuevo camión
            const result = yield client.query(`INSERT INTO camiones (placa, marca, color, m3, ficha, estado) 
         VALUES ($1, $2, $3, $4, $5, 'activo')
         RETURNING id, placa, marca, color, m3, ficha`, [placa.toUpperCase(), marca || '', color || '', parseFloat(m3), ficha || '']);
            console.log('✅ Camión creado por', (_a = req.user) === null || _a === void 0 ? void 0 : _a.role, ':', result.rows[0]);
            res.status(201).json(result.rows[0]);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error al crear camión:', error);
        res.status(500).json({ error: 'Error al crear camión' });
    }
}));
// PUT /camiones/:id - Editar camión (solo admin)
router.put('/:id', authMiddleware_1.default, (0, roleMiddleware_1.default)('admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { marca, color, m3, ficha } = req.body;
        const client = yield database_1.default.connect();
        try {
            // Validar que exista el camión
            const checkResult = yield client.query('SELECT id FROM camiones WHERE id = $1', [parseInt(id)]);
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ error: 'Camión no encontrado' });
            }
            // Actualizar camión
            const result = yield client.query(`UPDATE camiones 
         SET marca = $1, color = $2, m3 = $3, ficha = $4, updatedAt = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, placa, marca, color, m3, ficha`, [marca || '', color || '', parseFloat(m3) || 0, ficha || '', parseInt(id)]);
            console.log('✅ Camión actualizado:', result.rows[0]);
            res.json(result.rows[0]);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error al actualizar camión:', error);
        res.status(500).json({ error: 'Error al actualizar camión' });
    }
}));
// GET /camiones - Listar todos los camiones (solo admin)
router.get('/list/all', authMiddleware_1.default, (0, roleMiddleware_1.default)('admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield database_1.default.connect();
        try {
            const result = yield client.query('SELECT id, placa, marca, color, m3, ficha, estado FROM camiones ORDER BY placa ASC');
            res.json({ data: result.rows });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error al listar camiones:', error);
        res.status(500).json({ error: 'Error al listar camiones' });
    }
}));
exports.default = router;
//# sourceMappingURL=caminoRoutes.js.map