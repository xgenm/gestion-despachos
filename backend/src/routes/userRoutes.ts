import { Router } from 'express';
import db from '../db/database';
import checkRole from '../middleware/roleMiddleware';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
  const client = await db.connect();
  
  try {
    const result = await client.query("SELECT * FROM users");
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// POST new user (solo admin)
router.post('/', checkRole('admin'), async (req, res) => {
  const { name } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de usuario es requerido' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("INSERT INTO users (name) VALUES ($1) RETURNING id, name", [name.trim()]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    if ((err as Error).message.includes('UNIQUE constraint failed') || (err as Error).message.includes('duplicate key')) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }
    res.status(500).json({ error: 'Error al crear usuario', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// DELETE user (solo admin)
router.delete('/:id', checkRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("DELETE FROM users WHERE id = $1", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario', details: (err as Error).message });
  } finally {
    client.release();
  }
});

export default router;