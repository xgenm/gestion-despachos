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
let devDispatches = [];
let nextDispatchId = 1;
// GET /api/dispatches
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        // En modo desarrollo, retornar despachos simulados
        return res.json({ data: devDispatches });
    }
    const client = yield database_1.default.connect();
    try {
        const sql = `
      SELECT 
        d.*,
        u.name as userName,
        e.name as equipmentName,
        o.name as operatorName
      FROM dispatches d
      LEFT JOIN users u ON u.id = d.userId
      LEFT JOIN equipment e ON e.id = d.equipmentId
      LEFT JOIN operators o ON o.id = d.operatorId
      ORDER BY d.fecha DESC
    `;
        const result = yield client.query(sql);
        res.json({ data: result.rows });
    }
    catch (err) {
        console.error('Error al obtener despachos:', err);
        res.status(500).json({ error: 'Error al obtener despachos', details: err.message });
    }
    finally {
        client.release();
    }
}));
// POST /api/dispatches
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId } = req.body;
    // Validación básica de datos requeridos
    if (!despachoNo || !fecha || !hora || !camion || !placa || !cliente) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    // Validación de tipos
    if (isNaN(total) || (userId && isNaN(userId)) || (equipmentId && isNaN(equipmentId)) || (operatorId && isNaN(operatorId))) {
        return res.status(400).json({ error: 'Tipos de datos inválidos' });
    }
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        // En modo desarrollo, almacenar en memoria
        const newDispatch = {
            id: nextDispatchId++,
            despachoNo,
            fecha,
            hora,
            camion,
            placa,
            color,
            ficha,
            materials,
            cliente,
            celular,
            recibido,
            total,
            userId,
            equipmentId,
            operatorId,
            userName: 'Usuario',
            equipmentName: 'Equipo',
            operatorName: 'Operario'
        };
        devDispatches.push(newDispatch);
        return res.json({ id: newDispatch.id });
    }
    const client = yield database_1.default.connect();
    try {
        const sql = `INSERT INTO dispatches (despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`;
        const params = [despachoNo, fecha, hora, camion, placa, color, ficha, JSON.stringify(materials), cliente, celular, recibido, total, userId, equipmentId, operatorId];
        const result = yield client.query(sql, params);
        res.json({ id: result.rows[0].id });
    }
    catch (err) {
        console.error('Error al crear despacho:', err);
        res.status(500).json({ error: 'Error al crear despacho', details: err.message });
    }
    finally {
        client.release();
    }
}));
// DELETE /api/dispatches/:id
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    // Validación de ID
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        // En modo desarrollo, eliminar del almacenamiento simulado
        const index = devDispatches.findIndex(d => d.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Despacho no encontrado' });
        }
        devDispatches.splice(index, 1);
        return res.json({ message: 'Despacho eliminado correctamente' });
    }
    const client = yield database_1.default.connect();
    try {
        const sql = `DELETE FROM dispatches WHERE id = $1`;
        const result = yield client.query(sql, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Despacho no encontrado' });
        }
        res.json({ message: 'Despacho eliminado correctamente' });
    }
    catch (err) {
        console.error('Error al eliminar despacho:', err);
        res.status(500).json({ error: 'Error al eliminar despacho', details: err.message });
    }
    finally {
        client.release();
    }
}));
exports.default = router;
//# sourceMappingURL=dispatchRoutes.js.map