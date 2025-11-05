"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const database_1 = __importDefault(require("../db/database"));
class ProductModel {
    static createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                yield client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL DEFAULT 0,
          unit VARCHAR(20) DEFAULT 'm³',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
                // Insertar productos iniciales si la tabla está vacía
                const count = yield client.query('SELECT COUNT(*) as count FROM products');
                if (parseInt(count.rows[0].count) === 0) {
                    yield client.query(`
          INSERT INTO products (name, price, unit) VALUES
          ('Arena lavada', 1500.00, 'm³'),
          ('Arena sin lavar', 1200.00, 'm³'),
          ('Grava', 1800.00, 'm³'),
          ('Sub-base', 1000.00, 'm³'),
          ('Grava Arena', 1600.00, 'm³'),
          ('Granzote', 2000.00, 'm³'),
          ('Gravillín', 2200.00, 'm³'),
          ('Cascajo gris (Relleno)', 800.00, 'm³'),
          ('Base', 1100.00, 'm³'),
          ('Relleno amarillento', 700.00, 'm³')
        `);
                }
            }
            finally {
                client.release();
            }
        });
    }
    static getAllProducts() {
        return __awaiter(this, arguments, void 0, function* (activeOnly = false) {
            const client = yield database_1.default.connect();
            try {
                const query = activeOnly
                    ? 'SELECT * FROM products WHERE active = true ORDER BY name ASC'
                    : 'SELECT * FROM products ORDER BY name ASC';
                const result = yield client.query(query);
                return result.rows;
            }
            finally {
                client.release();
            }
        });
    }
    static getProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query('SELECT * FROM products WHERE id = $1', [id]);
                return result.rows.length > 0 ? result.rows[0] : null;
            }
            finally {
                client.release();
            }
        });
    }
    static createProduct(name_1, price_1) {
        return __awaiter(this, arguments, void 0, function* (name, price, unit = 'm³') {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query('INSERT INTO products (name, price, unit) VALUES ($1, $2, $3) RETURNING *', [name, price, unit]);
                return result.rows[0];
            }
            finally {
                client.release();
            }
        });
    }
    static updateProduct(id, name, price, unit) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query('UPDATE products SET name = $1, price = $2, unit = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *', [name, price, unit, id]);
                return result.rows.length > 0 ? result.rows[0] : null;
            }
            finally {
                client.release();
            }
        });
    }
    static deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                // Soft delete: marcar como inactivo en lugar de eliminar
                const result = yield client.query('UPDATE products SET active = false WHERE id = $1', [id]);
                return (result.rowCount || 0) > 0;
            }
            finally {
                client.release();
            }
        });
    }
    static activateProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield database_1.default.connect();
            try {
                const result = yield client.query('UPDATE products SET active = true WHERE id = $1', [id]);
                return (result.rowCount || 0) > 0;
            }
            finally {
                client.release();
            }
        });
    }
}
exports.ProductModel = ProductModel;
//# sourceMappingURL=Product.js.map