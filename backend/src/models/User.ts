import bcrypt from 'bcryptjs';
import db from '../db/database';

export interface User {
  id: number;
  username: string;
  password: string;
  role: string; // 'admin' o 'employee'
  created_by?: number; // ID del usuario que creó este registro
  created_at?: Date;
}

export class UserModel {
  static async createTable() {
    const client = await db.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'employee' NOT NULL,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } finally {
      client.release();
    }
  }

  static async createUser(username: string, password: string, role: string = 'employee', createdBy?: number): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await db.connect();
    
    try {
      const result = await client.query(
        'INSERT INTO users (username, password, role, created_by) VALUES ($1, $2, $3, $4) RETURNING id, username, password, role, created_by, created_at',
        [username, hashedPassword, role, createdBy || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findByUsername(username: string): Promise<User | null> {
    const client = await db.connect();
    
    try {
      const result = await client.query(
        'SELECT id, username, password, role FROM users WHERE username = $1',
        [username]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static async getAllUsers(): Promise<User[]> {
    const client = await db.connect();
    
    try {
      const result = await client.query(
        'SELECT id, username, role, created_by, created_at FROM users ORDER BY id ASC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async deleteUser(id: number): Promise<boolean> {
    const client = await db.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }
}