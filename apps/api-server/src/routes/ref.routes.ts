import { Router } from 'express';
import * as refController from '../controllers/ref.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/platni-razredi', refController.getPlatniRazredi);
router.get('/pozicije', refController.getPozicije);
router.get('/pozicije/:kljuc', refController.getPozicijaByKljuc);
router.get('/kategorije', refController.getKategorije);

export default router;
