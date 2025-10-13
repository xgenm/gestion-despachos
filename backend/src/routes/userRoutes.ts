import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all users
router.get('/', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows });
  });
});

// POST new user
router.post('/', (req, res) => {
  const { id, name } = req.body;
  db.run("INSERT INTO users (id, name) VALUES (?, ?)", [id, name], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// DELETE user
router.delete('/:id', (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

export default router;
