import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET /api/dispatches
router.get('/', (req, res) => {
  const sql = "SELECT * FROM dispatches ORDER BY fecha DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// POST /api/dispatches
router.post('/', (req, res) => {
  const { id, despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibi, total } = req.body;
  const sql = `INSERT INTO dispatches (id, despachoNo, fecha, hora, camion, placa, color, ficha, materials, cliente, celular, recibi, total)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, despachoNo, fecha, hora, camion, placa, color, ficha, JSON.stringify(materials), cliente, celular, recibi, total];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

export default router;
