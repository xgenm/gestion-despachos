const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function createCountersTable() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Crear tabla de contadores
    await client.query(`
      CREATE TABLE IF NOT EXISTS counters (
        id VARCHAR(50) PRIMARY KEY,
        current_value INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla counters creada');

    // Insertar contador inicial para despachos si no existe
    await client.query(`
      INSERT INTO counters (id, current_value)
      VALUES ('dispatch_number', 0)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Contador inicial para despachos creado');

    // Crear función para obtener siguiente número (atómica)
    await client.query(`
      CREATE OR REPLACE FUNCTION get_next_dispatch_number()
      RETURNS INTEGER AS $$
      DECLARE
        next_num INTEGER;
      BEGIN
        UPDATE counters 
        SET current_value = current_value + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 'dispatch_number'
        RETURNING current_value INTO next_num;
        
        RETURN next_num;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✓ Función get_next_dispatch_number() creada');

    console.log('\n✅ Tabla de contadores y función creadas exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

createCountersTable();
