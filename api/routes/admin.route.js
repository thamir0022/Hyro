import express from 'express';
import { verifyToken } from '../utils/index.js';
import { addHr, deleteHR, editHR, getAllHR, getHR, search } from '../controllers/admin.controller.js';

const router = express();

router.get("/hrs", verifyToken, getAllHR);
router.post("/add-hr", verifyToken, addHr);
router.get("/hr/:id?", verifyToken, getHR);
router.put("/hr/edit", verifyToken, editHR);
router.delete("/delete-hr/:id?", verifyToken, deleteHR);
router.get("/search", verifyToken, search);  

export default router;