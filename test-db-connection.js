const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestion_despachos',
  password: '123456',
  port: 5432,
});

async function testConnection() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const client = await pool.connect();
    console.log('¡Conexión exitosa!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Hora actual en la base de datos:', res.rows[0].now);
    
    client.release();
    await pool.end();
    console.log('Conexión cerrada.');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
}

testConnection();