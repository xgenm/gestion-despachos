import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import dispatchRoutes from '../src/routes/dispatchRoutes';
import userRoutes from '../src/routes/userRoutes';
import equipmentRoutes from '../src/routes/equipmentRoutes';
import operatorRoutes from '../src/routes/operatorRoutes';
import companyRoutes from '../src/routes/companyRoutes';
import clientRoutes from '../src/routes/clientRoutes';
import caminoRoutes from '../src/routes/caminoRoutes';
import authRoutes from '../src/routes/authRoutes';
import auditRoutes from '../src/routes/auditRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Permitir solicitudes desde el frontend en Vercel
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://gestion-despachos-2sls.vercel.app',
  'https://gestion-despachos-2sls-4frzj7dos-xgens-projects.vercel.app',
  'https://gestion-despachos-2sls-jrlv5in9g-xgens-projects.vercel.app',
  process.env.FRONTEND_URL || 'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed) || allowed.includes(origin))) {
      callback(null, true);
    } else {
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
app.options('*', cors());
app.use('/api/auth', authRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/camiones', caminoRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/clients', clientRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
