import { Router, Request, Response } from 'express';
import db from '../db/database';
import authenticateToken from '../middleware/authMiddleware';
import checkRole from '../middleware/roleMiddleware';

interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

const router = Router();

// GET /camiones?placa=XXX - Buscar camión por placa (público, sin autenticación)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { placa } = req.query;

    if (!placa) {
      return res.status(400).json({ error: 'Parámetro placa es requerido' });
    }

    const client = await db.connect();
    try {
      const result = await client.query(
        'SELECT id, placa, marca, color, m3, ficha FROM camiones WHERE placa = $1',
        [placa]
      );

      if (result.rows.length === 0) {
        return res.json({ found: false, data: null });
      }

      res.json({ 
        found: true, 
        data: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al buscar camión:', error);
    res.status(500).json({ error: 'Error al buscar camión' });
  }
});

// POST /camiones - Crear nuevo camión (empleado crea, admin puede editar después)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { placa, marca, color, m3, ficha } = req.body;

    // Validación básica
    if (!placa || placa.trim() === '') {
      return res.status(400).json({ error: 'Placa es requerida' });
    }

    if (!m3 || isNaN(parseFloat(m3))) {
      return res.status(400).json({ error: 'M3 debe ser un número válido' });
    }

    const client = await db.connect();
    try {
      // Verificar si ya existe la placa
      const checkResult = await client.query(
        'SELECT id FROM camiones WHERE placa = $1',
        [placa.toUpperCase()]
      );

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'La placa ya existe' });
      }

      // Crear nuevo camión
      const result = await client.query(
        `INSERT INTO camiones (placa, marca, color, m3, ficha, estado) 
         VALUES ($1, $2, $3, $4, $5, 'activo')
         RETURNING id, placa, marca, color, m3, ficha`,
        [placa.toUpperCase(), marca || '', color || '', parseFloat(m3), ficha || '']
      );

      console.log('✅ Camión creado por', req.user?.role, ':', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al crear camión:', error);
    res.status(500).json({ error: 'Error al crear camión' });
  }
});

// PUT /camiones/:id - Editar camión (solo admin)
router.put('/:id', authenticateToken, checkRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { marca, color, m3, ficha } = req.body;

    const client = await db.connect();
    try {
      // Validar que exista el camión
      const checkResult = await client.query(
        'SELECT id FROM camiones WHERE id = $1',
        [parseInt(id)]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Camión no encontrado' });
      }

      // Actualizar camión
      const result = await client.query(
        `UPDATE camiones 
         SET marca = $1, color = $2, m3 = $3, ficha = $4, updatedAt = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, placa, marca, color, m3, ficha`,
        [marca || '', color || '', parseFloat(m3) || 0, ficha || '', parseInt(id)]
      );

      console.log('✅ Camión actualizado:', result.rows[0]);
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al actualizar camión:', error);
    res.status(500).json({ error: 'Error al actualizar camión' });
  }
});

// GET /camiones - Listar todos los camiones (solo admin)
router.get('/list/all', authenticateToken, checkRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const client = await db.connect();
    try {
      const result = await client.query(
        'SELECT id, placa, marca, color, m3, ficha, estado FROM camiones ORDER BY placa ASC'
      );

      res.json({ data: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al listar camiones:', error);
    res.status(500).json({ error: 'Error al listar camiones' });
  }
});

export default router;
