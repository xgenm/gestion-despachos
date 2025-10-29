import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

import dispatchRoutes from './routes/dispatchRoutes';
import userRoutes from './routes/userRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import operatorRoutes from './routes/operatorRoutes';
import companyRoutes from './routes/companyRoutes';
import clientRoutes from './routes/clientRoutes';
import authRoutes from './routes/authRoutes';
import authenticateToken from './middleware/authMiddleware';
import checkRole from './middleware/roleMiddleware';

const app = express();
const port = process.env.PORT || 3002;

// Configuración de CORS ultra permisiva para Vercel
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*'
}));

app.use(express.json());

// Endpoint de prueba
app.get('/api/test', (req, res) => {
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
app.use('/api/clients', clientRoutes); // Permitir sin autenticación para facilitar auto-registro

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
export default app;