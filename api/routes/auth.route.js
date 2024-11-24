import express from 'express';
import { signIn, signOut, signUp, editProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../utils/index.js';

const app = express();

app.post('/sign-in', signIn);
app.post('/sign-up', signUp);
app.get('/sign-out', signOut);
app.patch('/edit-profile',verifyToken, editProfile);

export default app;