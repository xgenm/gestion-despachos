const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function resetAdminPassword() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL en Render');

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Actualizar la contraseña del usuario admin
    await client.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, 'admin']
    );
    
    console.log('✅ Contraseña del usuario admin actualizada exitosamente');
    console.log('   Usuario: admin');
    console.log('   Nueva Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

resetAdminPassword();
