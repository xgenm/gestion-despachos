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
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const authMiddleware_1 = __importDefault(require("./middleware/authMiddleware"));
const roleMiddleware_1 = __importDefault(require("./middleware/roleMiddleware"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
// Configuración de CORS ultra permisiva para Vercel
app.use((0, cors_1.default)({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*'
}));
app.use(express_1.default.json());
// Endpoint de prueba de conexión a BD
app.get('/api/test-db', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        // Obtener información del usuario admin
        const userResult = yield pool.query('SELECT id, username, role, LEFT(password, 20) as password_preview FROM users WHERE username = \'admin\'');
        const countResult = yield pool.query('SELECT COUNT(*) as count FROM users');
        yield pool.end();
        res.json({
            message: 'Conexión exitosa a PostgreSQL',
            userCount: countResult.rows[0].count,
            adminUser: userResult.rows[0],
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasJwtSecret: !!process.env.JWT_SECRET,
                nodeEnv: process.env.NODE_ENV
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Endpoint de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});
// Endpoint de test de login con debugging
app.post('/api/test-login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        res.json({
            received: { username, password, hasBody: !!req.body },
            headers: req.headers['content-type']
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes_1.default);
// Rutas protegidas (requieren autenticación)
// GET permitido para todos, POST/PUT/DELETE solo para admin
app.use('/api/dispatches', authMiddleware_1.default, dispatchRoutes_1.default);
// Rutas protegidas que requieren rol de administrador
app.use('/api/users', (0, roleMiddleware_1.default)('admin'), userRoutes_1.default);
app.use('/api/equipment', (0, roleMiddleware_1.default)('admin'), equipmentRoutes_1.default);
app.use('/api/operators', (0, roleMiddleware_1.default)('admin'), operatorRoutes_1.default);
app.use('/api/companies', (0, roleMiddleware_1.default)('admin'), companyRoutes_1.default);
app.use('/api/audit', (0, roleMiddleware_1.default)('admin'), auditRoutes_1.default); // Logs de auditoría solo para admin
app.use('/api/clients', clientRoutes_1.default); // Permitir sin autenticación para facilitar auto-registro
app.get('/', (req, res) => {
    res.send('Backend del sistema de despachos funcionando!');
});
// Solo iniciar el servidor en desarrollo local
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Backend escuchando en http://localhost:${port}`);
    });
}
// Manejo de cierre de la aplicación
process.on('SIGINT', () => {
    console.log('Cerrando servidor...');
    process.exit(0);
});
// Exportar para Vercel
exports.default = app;
//# sourceMappingURL=index.js.map