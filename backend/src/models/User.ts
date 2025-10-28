import bcrypt from 'bcryptjs';
import db from '../db/database';

export interface User {
  id: number;
  username: string;
  password: string;
  role: string; // 'admin' o 'employee'
}

export class UserModel {
  static async createTable() {
    const client = await db.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'employee' NOT NULL
        )
      `);
    } finally {
      client.release();
    }
  }

  static async createUser(username: string, password: string, role: string = 'employee'): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await db.connect();
    
    try {
      const result = await client.query(
        'INSERT INTO admins (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, password, role',
        [username, hashedPassword, role]
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
        'SELECT id, username, password, role FROM admins WHERE username = $1',
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
}