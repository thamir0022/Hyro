import express from 'express';
import { verifyToken } from '../utils/index.js';
import { addHr, deleteHR, editHR, getAllHR, getHR, search } from '../controllers/admin.controller.js';

const app = express();

app.get("/hrs", verifyToken, getAllHR);
app.post("/add-hr", verifyToken, addHr);
app.get("/hr/:id?", verifyToken, getHR);
app.put("/hr/edit", verifyToken, editHR);
app.delete("/delete-hr/:id?", verifyToken, deleteHR);
app.get("/search", verifyToken, search);  

export default app;