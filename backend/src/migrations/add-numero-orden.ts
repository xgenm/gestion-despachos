// Migración: Agregar columna numeroOrden a la tabla dispatches
import db from '../db/database';

export async function migrateAddNumeroOrden() {
  const client = await db.connect();
  
  try {
    console.log('🔄 Ejecutando migración: agregar numeroOrden a dispatches...');
    
    // Agregar columna si no existe
    await client.query(`
      ALTER TABLE dispatches 
      ADD COLUMN IF NOT EXISTS numeroOrden VARCHAR(50)
    `);
    
    console.log('✅ Migración completada: numeroOrden agregado');
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
  }
}
