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
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// POST /api/dispatches (Modificado para aceptar nuevos campos)
router.post('/', (req, res) => {
  const { id, despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId } = req.body;
  const sql = `INSERT INTO dispatches (id, despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibido, total, userId, equipmentId, operatorId)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, despachoNo, fecha, hora, camion, placa, color, ficha, JSON.stringify(materials), cliente, celular, recibido, total, userId, equipmentId, operatorId];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

export default router;