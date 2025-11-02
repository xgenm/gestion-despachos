import { Router } from 'express';
import db from '../db/database';

const router = Router();

// Almacenamiento simulado para modo desarrollo
let devClients: Array<{ id: number; name: string; companyId?: number }> = [
  { id: 1, name: 'Cliente Ejemplo', companyId: 1 }
];
let nextClientId = 2;

// GET all clients
router.get('/', async (req, res) => {
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    return res.json({ data: devClients });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("SELECT * FROM clients");
    res.json({ data: result.rows });
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: 'Error al obtener clientes', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// POST new client
router.post('/', async (req, res) => {
  const { name, companyId } = req.body;
  
  // Validación básica
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nombre de cliente es requerido' });
  }
  
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    // En modo desarrollo, verificar si ya existe
    const existingClient = devClients.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingClient) {
      return res.json(existingClient); // Retornar el cliente existente
    }
    
    // Crear nuevo cliente
    const newClient = { 
      id: nextClientId++, 
      name: name.trim(),
      companyId: companyId || 1
    };
    devClients.push(newClient);
    return res.json(newClient);
  }
  
  const client = await db.connect();
  
  try {
    // Verificar si ya existe
    const checkResult = await client.query("SELECT id FROM clients WHERE LOWER(name) = LOWER($1)", [name.trim()]);
    if (checkResult.rows.length > 0) {
      return res.json(checkResult.rows[0]); // Retornar el cliente existente
    }
    
    const result = await client.query(
      "INSERT INTO clients (name, companyId) VALUES ($1, $2) RETURNING id, name, companyId",
      [name.trim(), companyId || 1]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ error: 'Error al crear cliente', details: (err as Error).message });
  } finally {
    client.release();
  }
});

// DELETE client
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  const disableAuth = process.env.DISABLE_AUTH === 'true';
  
  if (disableAuth) {
    const index = devClients.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    devClients.splice(index, 1);
    return res.json({ message: 'Cliente eliminado correctamente' });
  }
  
  const client = await db.connect();
  
  try {
    const result = await client.query("DELETE FROM clients WHERE id = $1", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ error: 'Error al eliminar cliente', details: (err as Error).message });
  } finally {
    client.release();
  }
});

export default router;
