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
import authRoutes from './routes/authRoutes';
import authenticateToken from './middleware/authMiddleware';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Rutas públicas (sin autenticación)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/dispatches', authenticateToken, dispatchRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/equipment', authenticateToken, equipmentRoutes);
app.use('/api/operators', authenticateToken, operatorRoutes);
app.use('/api/companies', authenticateToken, companyRoutes);

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