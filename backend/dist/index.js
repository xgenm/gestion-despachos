"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
const dispatchRoutes_1 = __importDefault(require("./routes/dispatchRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const operatorRoutes_1 = __importDefault(require("./routes/operatorRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const authMiddleware_1 = __importDefault(require("./middleware/authMiddleware"));
const roleMiddleware_1 = __importDefault(require("./middleware/roleMiddleware"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
// Configuración de CORS más permisiva para desarrollo
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(express_1.default.json());
// Endpoint de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});
// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes_1.default);
// Rutas protegidas (requieren autenticación)
app.use('/api/dispatches', authMiddleware_1.default, dispatchRoutes_1.default);
// Rutas protegidas que requieren rol de administrador
app.use('/api/users', (0, roleMiddleware_1.default)('admin'), userRoutes_1.default);
app.use('/api/equipment', (0, roleMiddleware_1.default)('admin'), equipmentRoutes_1.default);
app.use('/api/operators', (0, roleMiddleware_1.default)('admin'), operatorRoutes_1.default);
app.use('/api/companies', (0, roleMiddleware_1.default)('admin'), companyRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default); // Permitir sin autenticación para facilitar auto-registro
app.get('/', (req, res) => {
    res.send('Backend del sistema de despachos funcionando!');
});
app.listen(port, () => {
    console.log(`Backend escuchando en http://localhost:${port}`);
});
// Manejo de cierre de la aplicación
process.on('SIGINT', () => {
    console.log('Cerrando servidor...');
    process.exit(0);
});
