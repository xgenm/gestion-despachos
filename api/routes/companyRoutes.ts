import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all companies
router.get('/', async (req, res) => {
  const client = await db.connect();
  
  try {
    const result = await client.query("SELECT * FROM companies");
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error al obtener empresas:', err);
    res.status(500).json({ error: 'Error al obtener empresas', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// POST new company
router.post('/', async (req, res) => {
  const { name, address, phone, email } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de empresa es requerido' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query(
      "INSERT INTO companies (name, address, phone, email) VALUES ($1, $2, $3, $4) RETURNING id, name, address, phone, email", 
      [name.trim(), address, phone, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear empresa:', err);
    if ((err as Error).message.includes('UNIQUE constraint failed') || (err as Error).message.includes('duplicate key')) {
      return res.status(400).json({ error: 'El nombre de empresa ya existe' });
    }
    res.status(500).json({ error: 'Error al crear empresa', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// PUT update company
router.put('/:id', async (req, res) => {
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
  
  const client = await db.connect();
  
  try {
    const result = await client.query(
      "UPDATE companies SET name = $1, address = $2, phone = $3, email = $4 WHERE id = $5 RETURNING id, name, address, phone, email", 
      [name.trim(), address, phone, email, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar empresa:', err);
    res.status(500).json({ error: 'Error al actualizar empresa', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// DELETE company
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("DELETE FROM companies WHERE id = $1", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar empresa:', err);
    res.status(500).json({ error: 'Error al eliminar empresa', details: (err as Error).message });
  } finally {
    client.release();
  }
});

export default router;