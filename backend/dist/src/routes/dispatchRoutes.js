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
const auditMiddleware_1 = require("../middleware/auditMiddleware");
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
        u.username as userName,
        e.name as equipmentName,
        o.name as operatorName
      FROM dispatches d
      LEFT JOIN users u ON u.id = d.userId
      LEFT JOIN equipment e ON e.id = d.equipmentId
      LEFT JOIN operators o ON o.id = d.operatorId
      ORDER BY d.fecha DESC
    `;
        const result = yield client.query(sql);
        // Mapear las columnas de PostgreSQL (minúsculas) al formato esperado por el frontend (camelCase)
        const mappedData = result.rows.map(row => ({
            id: row.id,
            despachoNo: row.despachono,
            fecha: row.fecha,
            hora: row.hora,
            camion: row.camion,
            placa: row.placa,
            color: row.color,
            ficha: row.ficha,
            materials: row.materials,
            cliente: row.cliente,
            celular: row.celular,
            total: row.total,
            userId: row.userid,
            equipmentId: row.equipmentid,
            operatorId: row.operatorid,
            userName: row.username,
            equipmentName: row.equipmentname,
            operatorName: row.operatorname
        }));
        // Log para debugging
        if (mappedData.length > 0) {
            console.log('📦 Primer despacho enviado al frontend:', {
                despachoNo: mappedData[0].despachoNo,
                userName: mappedData[0].userName,
                userId: mappedData[0].userId
            });
        }
        res.json({ data: mappedData });
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
    const { fecha, hora, camion, placa, color, ficha, materials, cliente, celular, total, userId, equipmentId, operatorId } = req.body;
    console.log('📥 Backend recibiendo despacho:', JSON.stringify({ fecha, hora, camion, placa, cliente, userId, total, materials }, null, 2));
    // Validación básica de datos requeridos (despachoNo ya no es necesario, se genera automáticamente)
    if (!fecha || !hora || !camion || !placa || !cliente) {
        console.error('❌ Faltan campos requeridos:', { fecha: !!fecha, hora: !!hora, camion: !!camion, placa: !!placa, cliente: !!cliente });
        return res.status(400).json({
            error: 'Faltan campos requeridos',
            missing: {
                fecha: !fecha,
                hora: !hora,
                camion: !camion,
                placa: !placa,
                cliente: !cliente
            }
        });
    }
    // Convertir y validar tipos
    const finalTotal = typeof total === 'string' ? parseFloat(total) : total;
    const finalUserId = userId && userId > 0 ? userId : 1; // Fallback a admin si no hay userId válido
    const finalEquipmentId = equipmentId && equipmentId > 0 ? equipmentId : null;
    const finalOperatorId = operatorId && operatorId > 0 ? operatorId : null;
    if (isNaN(finalTotal) || finalTotal < 0) {
        console.error('❌ Total inválido:', total);
        return res.status(400).json({ error: 'Total inválido' });
    }
    // Validar y procesar materials
    let finalMaterials;
    if (Array.isArray(materials)) {
        finalMaterials = materials;
    }
    else if (typeof materials === 'string') {
        try {
            finalMaterials = JSON.parse(materials);
        }
        catch (e) {
            console.error('❌ Error al parsear materials:', e);
            return res.status(400).json({ error: 'Formato de materiales inválido' });
        }
    }
    else {
        finalMaterials = [];
    }
    console.log('✅ Datos validados:', { userId: finalUserId, total: finalTotal, materials: finalMaterials.length });
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        // En modo desarrollo, almacenar en memoria con número automático
        const despachoNo = String(nextDispatchId).padStart(7, '0'); // 7 dígitos numéricos
        const newDispatch = {
            id: nextDispatchId++,
            despachoNo,
            fecha,
            hora,
            camion,
            placa,
            color,
            ficha,
            materials: finalMaterials,
            cliente,
            celular,
            total: finalTotal,
            userId: finalUserId,
            equipmentId: finalEquipmentId,
            operatorId: finalOperatorId,
            userName: 'Usuario',
            equipmentName: 'Equipo',
            operatorName: 'Operario'
        };
        devDispatches.push(newDispatch);
        return res.json({ id: newDispatch.id, despachoNo });
    }
    const client = yield database_1.default.connect();
    try {
        // Obtener siguiente número de despacho (atómico)
        const numberResult = yield client.query('SELECT get_next_dispatch_number() as next_number');
        const nextNumber = numberResult.rows[0].next_number;
        const despachoNo = String(nextNumber).padStart(7, '0'); // 7 dígitos numéricos
        console.log('🔢 Número generado:', despachoNo);
        const sql = `INSERT INTO dispatches (despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, total, userId, equipmentId, operatorId)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`;
        const params = [despachoNo, fecha, hora, camion, placa, color, ficha, JSON.stringify(finalMaterials), cliente, celular, finalTotal, finalUserId, finalEquipmentId, finalOperatorId];
        console.log('💾 Insertando en BD con userId:', finalUserId);
        const result = yield client.query(sql, params);
        const dispatchId = result.rows[0].id;
        console.log('✅ Despacho creado exitosamente. ID:', dispatchId, 'Número:', despachoNo);
        // Registrar en auditoría
        if (req.user) {
            yield (0, auditMiddleware_1.logManualAction)(req.user.id, req.user.username, 'CREATE', 'dispatch', dispatchId, { despachoNo, cliente, total: finalTotal }, req);
        }
        res.json({ id: dispatchId, despachoNo });
    }
    catch (err) {
        console.error('❌ Error al crear despacho:', err);
        res.status(500).json({ error: 'Error al crear despacho', details: err.message });
    }
    finally {
        client.release();
    }
}));
// PUT /api/dispatches/:id/number (solo admin puede cambiar el número)
router.put('/:id/number', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Verificar que el usuario sea admin
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden modificar el número de ticket.' });
    }
    const id = parseInt(req.params.id);
    const { despachoNo } = req.body;
    // Validación
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }
    if (!despachoNo || typeof despachoNo !== 'string') {
        return res.status(400).json({ error: 'Número de despacho inválido' });
    }
    const disableAuth = process.env.DISABLE_AUTH === 'true';
    if (disableAuth) {
        // En modo desarrollo
        const dispatch = devDispatches.find(d => d.id === id);
        if (!dispatch) {
            return res.status(404).json({ error: 'Despacho no encontrado' });
        }
        dispatch.despachoNo = despachoNo;
        return res.json({ message: 'Número de despacho actualizado correctamente', despachoNo });
    }
    const client = yield database_1.default.connect();
    try {
        const sql = `UPDATE dispatches SET despachoNo = $1 WHERE id = $2`;
        const result = yield client.query(sql, [despachoNo, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Despacho no encontrado' });
        }
        // Registrar en auditoría
        if (req.user) {
            yield (0, auditMiddleware_1.logManualAction)(req.user.id, req.user.username, 'UPDATE', 'dispatch', id, { field: 'despachoNo', newValue: despachoNo }, req);
        }
        res.json({ message: 'Número de despacho actualizado correctamente', despachoNo });
    }
    catch (err) {
        console.error('Error al actualizar número de despacho:', err);
        res.status(500).json({ error: 'Error al actualizar número de despacho', details: err.message });
    }
    finally {
        client.release();
    }
}));
// DELETE /api/dispatches/:id (solo admin)
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Verificar que el usuario sea admin
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden eliminar despachos.' });
    }
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
        // Registrar en auditoría
        if (req.user) {
            yield (0, auditMiddleware_1.logManualAction)(req.user.id, req.user.username, 'DELETE', 'dispatch', id, { deletedId: id }, req);
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