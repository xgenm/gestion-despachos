const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testQuery() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Probando query con JOIN...\n');
    
    const sql = `
      SELECT 
        d.*,
        u.username as userName,
        e.name as equipmentName,
        o.name as operatorName
      FROM dispatches d
      LEFT JOIN users u ON u.id = d.userId
      LEFT JOIN equipment e ON e.id = d.equipmentId
      LEFT JOIN operators o ON o.id = d.operatorId
      ORDER BY d.fecha DESC
      LIMIT 1
    `;
    
    const result = await client.query(sql);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log('📋 Columnas devueltas por PostgreSQL:');
      console.log(Object.keys(row));
      console.log('\n📦 Primer despacho:');
      console.log('  despachoNo (field despachono):', row.despachono);
      console.log('  userName (field username):', row.username);
      console.log('  userId:', row.userid);
      console.log('  cliente:', row.cliente);
      console.log('\n🔤 Objeto completo (primeros campos):');
      console.log({
        id: row.id,
        despachono: row.despachono,
        despachoNo: row.despachoNo,
        fecha: row.fecha,
        cliente: row.cliente,
        username: row.username,
        userName: row.userName,
        userid: row.userid
      });
    } else {
      console.log('⚠️ No hay despachos en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testQuery();
