import { Router, Request } from 'express';
import db from '../db/database';
import { logManualAction } from '../middleware/auditMiddleware';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

const router = Router();

// Almacenamiento simulado para modo desarrollo
let devDispatches: any[] = [];
let nextDispatchId = 1;

// GET /api/dispatches
router.get('/', async (req, res) => {
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    // En modo desarrollo, retornar despachos simulados
    return res.json({ data: devDispatches });
  }
  
  const client = await db.connect();
  
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
    const result = await client.query(sql);
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error al obtener despachos:', err);
    res.status(500).json({ error: 'Error al obtener despachos', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// POST /api/dispatches
router.post('/', async (req: AuthRequest, res) => {
  const { fecha, hora, camion, placa, color, ficha, materials, cliente, celular, total, userId, equipmentId, operatorId } = req.body;
  
  // Validación básica de datos requeridos (despachoNo ya no es necesario, se genera automáticamente)
  if (!fecha || !hora || !camion || !placa || !cliente) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  // Validación de tipos
  if (isNaN(total) || (userId && isNaN(userId)) || (equipmentId && isNaN(equipmentId)) || (operatorId && isNaN(operatorId))) {
    return res.status(400).json({ error: 'Tipos de datos inválidos' });
  }
  
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    // En modo desarrollo, almacenar en memoria con número automático
    const despachoNo = `TK-${String(nextDispatchId).padStart(6, '0')}`;
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
      total,
      userId,
      equipmentId,
      operatorId,
      userName: 'Usuario',
      equipmentName: 'Equipo',
      operatorName: 'Operario'
    };
    devDispatches.push(newDispatch);
    return res.json({ id: newDispatch.id, despachoNo });
  }
  
  const client = await db.connect();
  
  try {
    // Obtener siguiente número de despacho (atómico)
    const numberResult = await client.query('SELECT get_next_dispatch_number() as next_number');
    const nextNumber = numberResult.rows[0].next_number;
    const despachoNo = `TK-${String(nextNumber).padStart(6, '0')}`;
    
    const sql = `INSERT INTO dispatches (despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, total, userId, equipmentId, operatorId)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`;
    const params = [despachoNo, fecha, hora, camion, placa, color, ficha, JSON.stringify(materials), cliente, celular, total, userId, equipmentId, operatorId];
    
    const result = await client.query(sql, params);
    const dispatchId = result.rows[0].id;
    
    // Registrar en auditoría
    if (req.user) {
      await logManualAction(
        req.user.id,
        req.user.username,
        'CREATE',
        'dispatch',
        dispatchId,
        { despachoNo, cliente, total },
        req
      );
    }
    
    res.json({ id: dispatchId, despachoNo });
  } catch (err) {
    console.error('Error al crear despacho:', err);
    res.status(500).json({ error: 'Error al crear despacho', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// PUT /api/dispatches/:id/number (solo admin puede cambiar el número)
router.put('/:id/number', async (req: AuthRequest, res) => {
  // Verificar que el usuario sea admin
  if (req.user?.role !== 'admin') {
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
  
  const client = await db.connect();
  
  try {
    const sql = `UPDATE dispatches SET despachoNo = $1 WHERE id = $2`;
    const result = await client.query(sql, [despachoNo, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Despacho no encontrado' });
    }
    
    // Registrar en auditoría
    if (req.user) {
      await logManualAction(
        req.user.id,
        req.user.username,
        'UPDATE',
        'dispatch',
        id,
        { field: 'despachoNo', newValue: despachoNo },
        req
      );
    }
    
    res.json({ message: 'Número de despacho actualizado correctamente', despachoNo });
  } catch (err) {
    console.error('Error al actualizar número de despacho:', err);
    res.status(500).json({ error: 'Error al actualizar número de despacho', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// DELETE /api/dispatches/:id (solo admin)
router.delete('/:id', async (req: AuthRequest, res) => {
  // Verificar que el usuario sea admin
  if (req.user?.role !== 'admin') {
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
  
  const client = await db.connect();
  
  try {
    const sql = `DELETE FROM dispatches WHERE id = $1`;
    const result = await client.query(sql, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Despacho no encontrado' });
    }
    
    // Registrar en auditoría
    if (req.user) {
      await logManualAction(
        req.user.id,
        req.user.username,
        'DELETE',
        'dispatch',
        id,
        { deletedId: id },
        req
      );
    }
    
    res.json({ message: 'Despacho eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar despacho:', err);
    res.status(500).json({ error: 'Error al eliminar despacho', details: (err as Error).message });
  } finally {
    client.release();
  }
});

export default router;