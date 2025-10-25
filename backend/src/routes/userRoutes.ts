import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all users
router.get('/', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error('Error al obtener usuarios:', err.message);
      return res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
    }
    res.json({ data: rows });
  });
});

// POST new user
router.post('/', (req, res) => {
  const { name } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de usuario es requerido' });
  }
  
  db.run("INSERT INTO users (name) VALUES (?)", [name.trim()], function (err) {
    if (err) {
      console.error('Error al crear usuario:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe' });
      }
      return res.status(500).json({ error: 'Error al crear usuario', details: err.message });
    }
    res.json({ id: this.lastID, name: name.trim() });
  });
});

// DELETE user
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  db.run("DELETE FROM users WHERE id = ?", id, function (err) {
    if (err) {
      console.error('Error al eliminar usuario:', err.message);
      return res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario eliminado correctamente' });
  });
});

export default router;