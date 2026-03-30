import { Router } from 'express';
import * as orgController from '../controllers/org.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Sve rute zaštićene — mora biti prijavljen
router.use(protect);

// Organizacione jedinice
router.get('/jedinice', orgController.getAll);
router.get('/jedinice/stablo', orgController.getStablo);
router.get('/jedinice/:id', orgController.getById);
router.post('/jedinice', orgController.create);
router.patch('/jedinice/:id', orgController.update);
router.delete('/jedinice/:id', orgController.remove);

// Radna mjesta
router.get('/radna-mjesta', orgController.getRadnaMjesta);
router.post('/radna-mjesta', orgController.createRadnoMjesto);
router.patch('/radna-mjesta/:id', orgController.updateRadnoMjesto);
router.delete('/radna-mjesta/:id', orgController.removeRadnoMjesto);
router.get('/jedinice/:id/detalji', orgController.getJedinicaDetalji);

export default router;
