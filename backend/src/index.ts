import express from 'express';
import cors from 'cors';

import dispatchRoutes from './routes/dispatchRoutes';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/dispatches', dispatchRoutes);

app.get('/', (req, res) => {
  res.send('Backend del sistema de despachos funcionando!');
});

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});
