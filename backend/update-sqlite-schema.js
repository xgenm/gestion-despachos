// Script para actualizar el esquema de SQLite (agregar numeroOrden a dispatches)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('📝 Agregando columna numeroOrden a la tabla dispatches...');
  
  db.run(`ALTER TABLE dispatches ADD COLUMN numeroOrden TEXT`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✅ La columna numeroOrden ya existe');
      } else {
        console.error('❌ Error:', err.message);
      }
    } else {
      console.log('✅ Columna numeroOrden agregada correctamente');
    }
    
    // Verificar la estructura de la tabla
    db.all("PRAGMA table_info(dispatches)", (err, rows) => {
      if (err) {
        console.error('❌ Error al verificar estructura:', err.message);
      } else {
        console.log('\n📋 Columnas de la tabla dispatches:');
        rows.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
      }
      db.close();
    });
  });
});
