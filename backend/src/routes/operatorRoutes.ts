import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all operators
router.get('/', (req, res) => {
  db.all("SELECT * FROM operators", [], (err, rows) => {
    if (err) {
      console.error('Error al obtener operarios:', err.message);
      return res.status(500).json({ error: 'Error al obtener operarios', details: err.message });
    }
    res.json({ data: rows });
  });
});

// POST new operator
router.post('/', (req, res) => {
  const { name } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de operario es requerido' });
  }
  
  db.run("INSERT INTO operators (name) VALUES (?)", [name.trim()], function (err) {
    if (err) {
      console.error('Error al crear operario:', err.message);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'El nombre de operario ya existe' });
      }
      return res.status(500).json({ error: 'Error al crear operario', details: err.message });
    }
    res.json({ id: this.lastID, name: name.trim() });
  });
});

// DELETE operator
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  db.run("DELETE FROM operators WHERE id = ?", id, function (err) {
    if (err) {
      console.error('Error al eliminar operario:', err.message);
      return res.status(500).json({ error: 'Error al eliminar operario', details: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Operario no encontrado' });
    }
    
    res.json({ message: 'Operario eliminado correctamente' });
  });
});

export default router;