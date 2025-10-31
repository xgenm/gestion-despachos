import db from '../db/database';

export interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action: string; // 'CREATE', 'UPDATE', 'DELETE'
  entity_type: string; // 'user', 'dispatch', 'company', etc.
  entity_id?: number;
  details?: string; // JSON string con detalles del cambio
  ip_address?: string;
  created_at: Date;
}

export class AuditLogModel {
  static async createTable() {
    const client = await db.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          username VARCHAR(50) NOT NULL,
          action VARCHAR(20) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id INTEGER,
          details TEXT,
          ip_address VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Crear índices para búsquedas rápidas
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
      `);
    } finally {
      client.release();
    }
  }

  static async log(
    userId: number,
    username: string,
    action: string,
    entityType: string,
    entityId?: number,
    details?: any,
    ipAddress?: string
  ): Promise<void> {
    const client = await db.connect();
    
    try {
      await client.query(
        `INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, username, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress]
      );
    } finally {
      client.release();
    }
  }

  static async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    const client = await db.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getLogsByUser(userId: number, limit: number = 50): Promise<AuditLog[]> {
    const client = await db.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getLogsByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
    const client = await db.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC`,
        [entityType, entityId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}
