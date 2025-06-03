import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import cookieParser from 'cookie-parser';
import verifyRoutes from './routes/verify'
import commentRoutes from "./routes/comments";
import userRoutes from './routes/user';
import './models/Comment';
import './models/Post';
import session from 'express-session';
import collectionsRoutes from './routes/collections';


import uploadRoutes from './routes/upload';

import collectionRoutes from "./routes/collections";


dotenv.config();
console.log('MONGO_URI из .env:', process.env.MONGO_URI);
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, //  ОБЯЗАТЕЛЬНО
}))
app.use(express.json());
app.use(cookieParser())


console.log('🔥 index.ts загружен, подключаю authRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/auth/verify', verifyRoutes);
app.use('/api/posts', uploadRoutes);
app.use("/api/comments", commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionsRoutes);


app.use(session({
  secret: process.env.JWT_SECRET!,
  resave: false,
  saveUninitialized: false,
}));



mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server on http://localhost:5000'));
  })
  .catch((err) => console.error(err));
