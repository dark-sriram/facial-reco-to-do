import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import routes from './routes/routesNotes.js';
import { connectDB } from './config/db.js';
import rateLimiter from '../src/middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
    cors({
        origin: ['http://localhost:5173', 'http://localhost:5174'],
    })
);
app.use(express.json());
app.use(rateLimiter);

app.use('/api/notes', routes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('server is started');
    });
});

//pass GY7Zt60qxpHxAteA

//mongodb+srv://sri812469:GY7Zt60qxpHxAteA@cluster0.sv1bszo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
