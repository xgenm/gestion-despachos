import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all operators
router.get('/', (req, res) => {
  db.all("SELECT * FROM operators", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

// POST new operator
router.post('/', (req, res) => {
  const { id, name } = req.body;
  db.run("INSERT INTO operators (id, name) VALUES (?, ?)", [id, name], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// DELETE operator
router.delete('/:id', (req, res) => {
  db.run("DELETE FROM operators WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

export default router;
