import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import transaccionesRoutes from './src/routes/transacciones.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import clientesRoutes from './src/routes/clientes.routes.js';

const app = express();

// Configura CORS para permitir solicitudes desde http://localhost:5173
app.use(cors({
    origin: 'http://localhost:5176'
}));

app.use(bodyParser.json());

// Rutas
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/clientes', clientesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
