const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://gestion_despachos_user:DN0eX71qsu0L3TVYxiPklmB2pVaNWPpi@dpg-d40hvrs9c44c73bbfna0-a.oregon-postgres.render.com/gestion_despachos?sslmode=require';

async function fixUserIdZero() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Contar despachos con userId = 0
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM dispatches
      WHERE userId = 0
    `);
    console.log(`\n📊 Despachos con userId=0: ${countResult.rows[0].total}`);

    if (countResult.rows[0].total > 0) {
      // Actualizar userId=0 a userId=1 (admin)
      const updateResult = await client.query(`
        UPDATE dispatches 
        SET userId = 1
        WHERE userId = 0
      `);
      console.log(`✓ ${updateResult.rowCount} despachos actualizados a userId=1 (admin)`);
    }

    // Verificar resultado
    const verifyResult = await client.query(`
      SELECT 
        d.despachoNo,
        d.userId,
        u.username as userName
      FROM dispatches d
      LEFT JOIN users u ON u.id = d.userId
      ORDER BY d.id DESC
      LIMIT 5
    `);

    console.log('\n🔍 Últimos 5 despachos después de la corrección:');
    verifyResult.rows.forEach(row => {
      console.log(`  Despacho ${row.despachono}: userId=${row.userid}, userName=${row.username || 'NULL'}`);
    });

    console.log('\n✅ Corrección completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

fixUserIdZero();
