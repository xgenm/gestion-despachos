const { Client } = require('pg');

const DATABASE_URL = 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function checkUser() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    const result = await client.query('SELECT id, username, role, LEFT(password, 30) as password_preview FROM users');
    
    console.log('\n👥 Usuarios en la base de datos:');
    if (result.rows.length === 0) {
      console.log('⚠️  No hay usuarios en la tabla users');
    } else {
      result.rows.forEach(user => {
        console.log(`\n  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Password (preview): ${user.password_preview}...`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUser();
