const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyDispatches() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando despachos en la base de datos...\n');
    
    // Verificar últimos 10 despachos con JOIN
    const result = await client.query(`
      SELECT 
        d.id,
        d.despachoNo,
        d.fecha,
        d.cliente,
        d.userId,
        u.username as userName,
        e.name as equipmentName,
        o.name as operatorName
      FROM dispatches d
      LEFT JOIN users u ON u.id = d.userId
      LEFT JOIN equipment e ON e.id = d.equipmentId
      LEFT JOIN operators o ON o.id = d.operatorId
      ORDER BY d.fecha DESC, d.id DESC
      LIMIT 10
    `);
    
    console.log(`📊 Últimos ${result.rows.length} despachos:\n`);
    
    result.rows.forEach(row => {
      console.log(`  Ticket: ${row.despachono || 'N/A'}`);
      console.log(`  Cliente: ${row.cliente}`);
      console.log(`  userId: ${row.userid}`);
      console.log(`  userName: ${row.username || '⚠️ NO ASIGNADO'}`);
      console.log(`  Fecha: ${row.fecha}`);
      console.log(`  ---`);
    });
    
    // Contar despachos sin userName
    const countNoUser = await client.query(`
      SELECT COUNT(*) as count
      FROM dispatches d
      LEFT JOIN users u ON u.id = d.userId
      WHERE u.username IS NULL
    `);
    
    console.log(`\n⚠️ Despachos sin usuario asignado: ${countNoUser.rows[0].count}`);
    
    // Verificar usuarios en la tabla users
    const users = await client.query('SELECT id, username, role FROM users ORDER BY id');
    console.log(`\n👥 Usuarios en la base de datos (${users.rows.length}):`);
    users.rows.forEach(u => {
      console.log(`  ID: ${u.id} - Username: ${u.username} - Role: ${u.role}`);
    });
    
    // Verificar si hay despachos con userId inválido
    const invalidUserIds = await client.query(`
      SELECT DISTINCT userId
      FROM dispatches
      WHERE userId NOT IN (SELECT id FROM users)
      ORDER BY userId
    `);
    
    if (invalidUserIds.rows.length > 0) {
      console.log(`\n❌ UserIds inválidos encontrados en despachos:`);
      invalidUserIds.rows.forEach(row => {
        console.log(`  userId: ${row.userid} (no existe en tabla users)`);
      });
      
      // Preguntar si quiere corregirlos (en este script solo mostramos)
      console.log(`\n💡 Sugerencia: Ejecuta fix-invalid-userids.js para corregir estos registros`);
    } else {
      console.log(`\n✅ Todos los userId en despachos son válidos`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDispatches();
