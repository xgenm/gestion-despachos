import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET /api/dispatches
router.get('/', async (req, res) => {
  const client = await db.connect();
  
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
router.post('/', async (req, res) => {
  const { despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId } = req.body;
  
  // Validación básica de datos requeridos
  if (!despachoNo || !fecha || !hora || !camion || !placa || !cliente) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  // Validación de tipos
  if (isNaN(total) || (userId && isNaN(userId)) || (equipmentId && isNaN(equipmentId)) || (operatorId && isNaN(operatorId))) {
    return res.status(400).json({ error: 'Tipos de datos inválidos' });
  }
  
  const client = await db.connect();
  
  try {
    const sql = `INSERT INTO dispatches (despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`;
    const params = [despachoNo, fecha, hora, camion, placa, color, ficha, JSON.stringify(materials), cliente, celular, recibido, total, userId, equipmentId, operatorId];
    
    const result = await client.query(sql, params);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error('Error al crear despacho:', err);
    res.status(500).json({ error: 'Error al crear despacho', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// DELETE /api/dispatches/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const client = await db.connect();
  
  try {
    const sql = `DELETE FROM dispatches WHERE id = $1`;
    const result = await client.query(sql, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Despacho no encontrado' });
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