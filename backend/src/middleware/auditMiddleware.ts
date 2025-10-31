import { Request, Response, NextFunction } from 'express';
import { AuditLogModel } from '../models/AuditLog';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const auditLog = (entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json.bind(res);
    
    res.json = function(body: any) {
      // Solo registrar si la operación fue exitosa (código 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const action = req.method === 'POST' ? 'CREATE' : 
                      req.method === 'PUT' || req.method === 'PATCH' ? 'UPDATE' : 
                      req.method === 'DELETE' ? 'DELETE' : 'READ';
        
        const user = req.user;
        const entityId = req.params.id ? parseInt(req.params.id) : body?.id;
        const ipAddress = req.ip || req.socket.remoteAddress;
        
        // Guardar detalles relevantes según la acción
        let details: any = {};
        if (action === 'CREATE' || action === 'UPDATE') {
          details = { ...req.body };
          // Eliminar información sensible
          delete details.password;
        } else if (action === 'DELETE') {
          details = { deletedId: entityId };
        }
        
        // Registrar en segundo plano (no bloquear la respuesta)
        if (user) {
          AuditLogModel.log(
            user.id,
            user.username,
            action,
            entityType,
            entityId,
            details,
            ipAddress
          ).catch(err => console.error('Error al registrar auditoría:', err));
        }
      }
      
      return originalSend(body);
    };
    
    next();
  };
};

export const logManualAction = async (
  userId: number,
  username: string,
  action: string,
  entityType: string,
  entityId?: number,
  details?: any,
  req?: Request
) => {
  const ipAddress = req ? (req.ip || req.socket.remoteAddress) : undefined;
  await AuditLogModel.log(userId, username, action, entityType, entityId, details, ipAddress);
};
