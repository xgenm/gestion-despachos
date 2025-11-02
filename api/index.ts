import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import dispatchRoutes from './routes/dispatchRoutes';
import userRoutes from './routes/userRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import operatorRoutes from './routes/operatorRoutes';
import companyRoutes from './routes/companyRoutes';
import clientRoutes from './routes/clientRoutes';
import caminoRoutes from './routes/caminoRoutes';
import authRoutes from './routes/authRoutes';
import auditRoutes from './routes/auditRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Permitir solicitudes desde el mismo dominio y localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://gestion-despachos-2sls.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin?.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir para debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type']
}));

// Manejo explícito de preflight
app.options('*', cors());

// Rutas de API
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

export default (req: any, res: any) => {
  return app(req, res);
};
