import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import dispatchRoutes from '../src/routes/dispatchRoutes';
import userRoutes from '../src/routes/userRoutes';
import equipmentRoutes from '../src/routes/equipmentRoutes';
import operatorRoutes from '../src/routes/operatorRoutes';
import companyRoutes from '../src/routes/companyRoutes';
import clientRoutes from '../src/routes/clientRoutes';
import authRoutes from '../src/routes/authRoutes';
import authenticateToken from '../src/middleware/authMiddleware';
import checkRole from '../src/middleware/roleMiddleware';

const app = express();

// Configuración de CORS más permisiva
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

// Endpoint de prueba
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/dispatches', authenticateToken, dispatchRoutes);

// Rutas protegidas que requieren rol de administrador
app.use('/api/users', checkRole('admin'), userRoutes);
app.use('/api/equipment', checkRole('admin'), equipmentRoutes);
app.use('/api/operators', checkRole('admin'), operatorRoutes);
app.use('/api/companies', checkRole('admin'), companyRoutes);
app.use('/api/clients', clientRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Backend del sistema de despachos funcionando!');
});

// Exportar como Serverless Function para Vercel
export default app;
