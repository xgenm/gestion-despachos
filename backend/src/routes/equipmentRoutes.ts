import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all equipment
router.get('/', (req, res) => {
  db.all("SELECT * FROM equipment", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

// POST new equipment
router.post('/', (req, res) => {
  const { id, name } = req.body;
  db.run("INSERT INTO equipment (id, name) VALUES (?, ?)", [id, name], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// DELETE equipment
router.delete('/:id', (req, res) => {
  db.run("DELETE FROM equipment WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

export default router;
