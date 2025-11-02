import { Router } from 'express';
import { AuditLogModel } from '../models/AuditLog';

const router = Router();

// GET /api/audit/logs - Obtener logs recientes (solo admin)
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await AuditLogModel.getRecentLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/audit/user/:id - Obtener logs de un usuario específico (solo admin)
router.get('/user/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await AuditLogModel.getLogsByUser(userId, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs de usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/audit/entity/:type/:id - Obtener logs de una entidad específica (solo admin)
router.get('/entity/:type/:id', async (req, res) => {
  try {
    const entityType = req.params.type;
    const entityId = parseInt(req.params.id);
    const logs = await AuditLogModel.getLogsByEntity(entityType, entityId);
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs de entidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
