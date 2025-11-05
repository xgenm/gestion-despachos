const { ProductModel } = require('./dist/src/models/Product');

async function initProductsTable() {
  try {
    console.log('🔧 Creando tabla de productos...');
    await ProductModel.createTable();
    console.log('✅ Tabla de productos creada e inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla de productos:', error);
    process.exit(1);
  }
}

initProductsTable();
