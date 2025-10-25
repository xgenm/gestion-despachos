import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET /api/dispatches (Modificado para incluir JOINs)
router.get('/', (req, res) => {
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
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener despachos:', err.message);
      res.status(500).json({ error: 'Error al obtener despachos', details: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// POST /api/dispatches (Modificado para aceptar nuevos campos)
router.post('/', (req, res) => {
  const { despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId } = req.body;
  
  // Validación básica de datos requeridos
  if (!despachoNo || !fecha || !hora || !camion || !placa || !cliente) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  // Validación de tipos
  if (isNaN(total) || (userId && isNaN(userId)) || (equipmentId && isNaN(equipmentId)) || (operatorId && isNaN(operatorId))) {
    return res.status(400).json({ error: 'Tipos de datos inválidos' });
  }
  
  const sql = `INSERT INTO dispatches (despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [despachoNo, fecha, hora, camion, placa, color, ficha, JSON.stringify(materials), cliente, celular, recibido, total, userId, equipmentId, operatorId];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error al crear despacho:', err.message);
      res.status(500).json({ error: 'Error al crear despacho', details: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// DELETE /api/dispatches/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const sql = `DELETE FROM dispatches WHERE id = ?`;
  
  db.run(sql, [id], function (err) {
    if (err) {
      console.error('Error al eliminar despacho:', err.message);
      res.status(500).json({ error: 'Error al eliminar despacho', details: err.message });
      return;
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Despacho no encontrado' });
    }
    
    res.json({ message: 'Despacho eliminado correctamente' });
  });
});

export default router;