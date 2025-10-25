import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all equipment
router.get('/', (req, res) => {
  db.all("SELECT * FROM equipment", [], (err, rows) => {
    if (err) {
      console.error('Error al obtener equipos:', err.message);
      return res.status(500).json({ error: 'Error al obtener equipos', details: err.message });
    }
    res.json({ data: rows });
  });
});

// POST new equipment
router.post('/', (req, res) => {
  const { name } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de equipo es requerido' });
  }
  
  db.run("INSERT INTO equipment (name) VALUES (?)", [name.trim()], function (err) {
    if (err) {
      console.error('Error al crear equipo:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'El nombre de equipo ya existe' });
      }
      return res.status(500).json({ error: 'Error al crear equipo', details: err.message });
    }
    res.json({ id: this.lastID, name: name.trim() });
  });
});

// DELETE equipment
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  db.run("DELETE FROM equipment WHERE id = ?", id, function (err) {
    if (err) {
      console.error('Error al eliminar equipo:', err.message);
      return res.status(500).json({ error: 'Error al eliminar equipo', details: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json({ message: 'Equipo eliminado correctamente' });
  });
});

export default router;