import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let pool;
let db;

if (process.env.DATABASE_URL) {
  // PostgreSQL configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // SQLite configuration
  (async () => {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
  })();
}

export const query = (text, params) => {
  if (pool) {
    return pool.query(text, params);
  } else {
    return db.all(text, params);
  }
};

export default {
  query,
  pool: pool || db
};
