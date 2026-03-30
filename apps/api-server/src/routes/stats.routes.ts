import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/dashboard', statsController.getDashboard);
router.get('/zaposlenici-po-sektoru', statsController.getZaposleniciPoSektoru);
router.get('/platni-razredi', statsController.getPlatniRazrediStats);
router.get('/sistematizacija', statsController.getSistematizacija);

export default router;
