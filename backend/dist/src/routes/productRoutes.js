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
const express_1 = __importDefault(require("express"));
const Product_1 = require("../models/Product");
const router = express_1.default.Router();
// GET /api/products - Obtener todos los productos
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeOnly = req.query.active === 'true';
        const products = yield Product_1.ProductModel.getAllProducts(activeOnly);
        res.json({ data: products });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
}));
// GET /api/products/:id - Obtener un producto por ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const product = yield Product_1.ProductModel.getProductById(id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: error.message });
    }
}));
// POST /api/products - Crear nuevo producto
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, unit } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Nombre y precio son requeridos' });
        }
        const product = yield Product_1.ProductModel.createProduct(name, parseFloat(price), unit || 'm³');
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
    }
}));
// PUT /api/products/:id - Actualizar producto
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { name, price, unit } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Nombre y precio son requeridos' });
        }
        const product = yield Product_1.ProductModel.updateProduct(id, name, parseFloat(price), unit || 'm³');
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
}));
// DELETE /api/products/:id - Desactivar producto (soft delete)
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const success = yield Product_1.ProductModel.deleteProduct(id);
        if (!success) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto desactivado correctamente' });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
}));
// PUT /api/products/:id/activate - Reactivar producto
router.put('/:id/activate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const success = yield Product_1.ProductModel.activateProduct(id);
        if (!success) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto activado correctamente' });
    }
    catch (error) {
        console.error('Error activating product:', error);
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=productRoutes.js.map