const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function testQuery() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Verificar estructura de tabla users
    const usersStructure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('\n📋 Estructura tabla USERS:');
    usersStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    // Probar el query con JOIN
    const result = await client.query(`
      SELECT 
        d.id,
        d.despachoNo,
        d.userId,
        u.username as userName
      FROM dispatches d
      LEFT JOIN users u ON u.id = d.userId
      LIMIT 3
    `);

    console.log('\n🔍 Primeros 3 despachos con userName:');
    result.rows.forEach(row => {
      console.log(`  Despacho ${row.despachono}: userId=${row.userid}, userName=${row.username || 'NULL'}`);
    });

    // Verificar cuántos despachos tienen userId null
    const nullCount = await client.query(`
      SELECT COUNT(*) as total
      FROM dispatches
      WHERE userId IS NULL
    `);
    console.log(`\n⚠️  Despachos con userId NULL: ${nullCount.rows[0].total}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

testQuery();
