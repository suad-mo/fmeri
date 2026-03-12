import { Router } from 'express';
import * as cafeController from '../controllers/cafe.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Sve rute ispod ove linije zahtijevaju JWT token
router.use(protect);

router.get('/tables', cafeController.getAllTables);
router.post('/tables', cafeController.createTable);
router.patch('/tables/:id/position', cafeController.updateTablePosition);

export default router;
