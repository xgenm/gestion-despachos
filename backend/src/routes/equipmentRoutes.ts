import { Router } from 'express';
import db from '../db/database';

const router = Router();

// GET all equipment
router.get('/', async (req, res) => {
  const client = await db.connect();
  
  try {
    const result = await client.query("SELECT * FROM equipment");
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error al obtener equipos:', err);
    res.status(500).json({ error: 'Error al obtener equipos', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// POST new equipment
router.post('/', async (req, res) => {
  const { name } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de equipo es requerido' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("INSERT INTO equipment (name) VALUES ($1) RETURNING id, name", [name.trim()]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear equipo:', err);
    if ((err as Error).message.includes('UNIQUE constraint failed') || (err as Error).message.includes('duplicate key')) {
      return res.status(400).json({ error: 'El nombre de equipo ya existe' });
    }
    res.status(500).json({ error: 'Error al crear equipo', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("DELETE FROM equipment WHERE id = $1", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    
    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar equipo:', err);
    res.status(500).json({ error: 'Error al eliminar equipo', details: (err as Error).message });
  } finally {
    client.release();
  }
});

export default router;