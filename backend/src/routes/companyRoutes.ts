import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all companies
router.get('/', (req, res) => {
  db.all("SELECT * FROM companies", [], (err, rows) => {
    if (err) {
      console.error('Error al obtener empresas:', err.message);
      return res.status(500).json({ error: 'Error al obtener empresas', details: err.message });
    }
    res.json({ data: rows });
  });
});

// POST new company
router.post('/', (req, res) => {
  const { name, address, phone, email } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de empresa es requerido' });
  }
  
  db.run("INSERT INTO companies (name, address, phone, email) VALUES (?, ?, ?, ?)", 
    [name.trim(), address, phone, email], 
    function (err) {
      if (err) {
        console.error('Error al crear empresa:', err.message);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'El nombre de empresa ya existe' });
        }
        return res.status(500).json({ error: 'Error al crear empresa', details: err.message });
      }
      res.json({ id: this.lastID, name: name.trim(), address, phone, email });
    }
  );
});

// PUT update company
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, address, phone, email } = req.body;
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de empresa es requerido' });
  }
  
  db.run("UPDATE companies SET name = ?, address = ?, phone = ?, email = ? WHERE id = ?", 
    [name.trim(), address, phone, email, id], 
    function (err) {
      if (err) {
        console.error('Error al actualizar empresa:', err.message);
        return res.status(500).json({ error: 'Error al actualizar empresa', details: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }
      
      res.json({ id, name: name.trim(), address, phone, email });
    }
  );
});

// DELETE company
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  db.run("DELETE FROM companies WHERE id = ?", id, function (err) {
    if (err) {
      console.error('Error al eliminar empresa:', err.message);
      return res.status(500).json({ error: 'Error al eliminar empresa', details: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    res.json({ message: 'Empresa eliminada correctamente' });
  });
});

export default router;