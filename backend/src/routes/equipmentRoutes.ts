import { Router } from 'express';
import db from '../db/database';

const router = Router();

// Almacenamiento simulado para modo desarrollo
let devEquipment: Array<{ id: number; name: string }> = [
  { id: 1, name: 'Equipo 1' },
  { id: 2, name: 'Equipo 2' }
];
let nextEquipmentId = 3;

// GET all equipment
router.get('/', async (req, res) => {
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    return res.json({ data: devEquipment });
  }
  
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
  
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    // En modo desarrollo, agregar a lista simulada
    const newEquipment = { id: nextEquipmentId++, name: name.trim() };
    devEquipment.push(newEquipment);
    return res.json(newEquipment);
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
  
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    // En modo desarrollo, eliminar de lista simulada
    const index = devEquipment.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    devEquipment.splice(index, 1);
    return res.json({ message: 'Equipo eliminado correctamente' });
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