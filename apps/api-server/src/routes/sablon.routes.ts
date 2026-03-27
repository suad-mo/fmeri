import { Router } from 'express';
import * as sablonController from '../controllers/sablon.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Globalni šabloni
router.get('/globalni', sablonController.getGlobalniSabloni);
router.get('/globalni/:tip', sablonController.getGlobalniSablonByTip);
router.patch('/globalni/:id', sablonController.updateGlobalniSablon);

// Organ šabloni
router.get('/organ/:organId', sablonController.getOrganSablon);
router.put('/organ/:organId', sablonController.createOrUpdateOrganSablon);
router.get('/organ/:organId/efektivna', sablonController.getEfektivnaPravila);

export default router;
