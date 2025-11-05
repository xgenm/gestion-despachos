"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Importar rutas
const dispatchRoutes_1 = __importDefault(require("../src/routes/dispatchRoutes"));
const userRoutes_1 = __importDefault(require("../src/routes/userRoutes"));
const equipmentRoutes_1 = __importDefault(require("../src/routes/equipmentRoutes"));
const operatorRoutes_1 = __importDefault(require("../src/routes/operatorRoutes"));
const companyRoutes_1 = __importDefault(require("../src/routes/companyRoutes"));
const clientRoutes_1 = __importDefault(require("../src/routes/clientRoutes"));
const caminoRoutes_1 = __importDefault(require("../src/routes/caminoRoutes"));
const authRoutes_1 = __importDefault(require("../src/routes/authRoutes"));
const auditRoutes_1 = __importDefault(require("../src/routes/auditRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS - Permitir solicitudes desde el frontend en Vercel
const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://gestion-despachos-2sls.vercel.app',
    'https://gestion-despachos-2sls-4frzj7dos-xgens-projects.vercel.app',
    'https://gestion-despachos-2sls-jrlv5in9g-xgens-projects.vercel.app',
    process.env.FRONTEND_URL || 'http://localhost:3001'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(allowed => origin.includes(allowed) || allowed.includes(origin))) {
            callback(null, true);
        }
        else {
            console.warn(`CORS bloqueado: ${origin}`);
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type']
}));
// Manejo explícito de preflight
app.options('*', (0, cors_1.default)());
// Rutas de API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/dispatches', dispatchRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default);
app.use('/api/operators', operatorRoutes_1.default);
app.use('/api/companies', companyRoutes_1.default);
app.use('/api/camiones', caminoRoutes_1.default);
app.use('/api/audit', auditRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});
exports.default = app;
//# sourceMappingURL=index.js.map