import { Router } from 'express';
import { Router } from 'express';
import db from '../db/database';
import checkRole from '../middleware/roleMiddleware';

const router = Router();

// Almacenamiento simulado para modo desarrollo
let devOperators: Array<{ id: number; name: string }> = [
  { id: 1, name: 'Operario 1' },
  { id: 2, name: 'Operario 2' }
];
let nextOperatorId = 3;

// GET all operators
router.get('/', async (req, res) => {
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    return res.json({ data: devOperators });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("SELECT * FROM operators");
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error al obtener operarios:', err);
    res.status(500).json({ error: 'Error al obtener operarios', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// POST new operator (solo admin)
router.post('/', checkRole('admin'), async (req, res) => {
  const { name } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de operario es requerido' });
  }
  
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    // En modo desarrollo, agregar a lista simulada
    const newOperator = { id: nextOperatorId++, name: name.trim() };
    devOperators.push(newOperator);
    return res.json(newOperator);
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("INSERT INTO operators (name) VALUES ($1) RETURNING id, name", [name.trim()]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear operario:', err);
    if ((err as Error).message.includes('UNIQUE constraint failed') || (err as Error).message.includes('duplicate key')) {
      return res.status(400).json({ error: 'El nombre de operario ya existe' });
    }
    res.status(500).json({ error: 'Error al crear operario', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// DELETE operator (solo admin)
router.delete('/:id', checkRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validación de ID
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    // En modo desarrollo, eliminar de lista simulada
    const index = devOperators.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Operario no encontrado' });
    }
    devOperators.splice(index, 1);
    return res.json({ message: 'Operario eliminado correctamente' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("DELETE FROM operators WHERE id = $1", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Operario no encontrado' });
    }
    
    res.json({ message: 'Operario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar operario:', err);
    res.status(500).json({ error: 'Error al eliminar operario', details: (err as Error).message });
  } finally {
    client.release();
  }
});

export default router;