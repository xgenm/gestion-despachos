import express from 'express';
import cors from 'cors';

import dispatchRoutes from './routes/dispatchRoutes';
import userRoutes from './routes/userRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import operatorRoutes from './routes/operatorRoutes';
import companyRoutes from './routes/companyRoutes';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/dispatches', dispatchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/companies', companyRoutes);

app.get('/', (req, res) => {
  res.send('Backend del sistema de despachos funcionando!');
});

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});