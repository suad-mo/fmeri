import { Router } from 'express';
import * as organController from '../controllers/organ.controller';
import { protect, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Javni (autentificirani) endpointi
router.get('/', organController.getOrgani);
router.get('/:id', organController.getOrgan);
router.get('/:id/struktura', organController.getOrganStruktura);
router.get('/u-sastavu/:organId', organController.getOrganiUSastavu);
router.get('/:id/radna-mjesta', organController.getRadnaMjestaOrgana);

// Admin endpointi
router.post('/', requireRole('admin'), organController.createOrgan);
router.patch('/:id', requireRole('admin'), organController.updateOrgan);
router.delete('/:id', requireRole('admin'), organController.deleteOrgan);

router.post('/:id/osnovne-jedinice', requireRole('admin'), organController.addOsnovnaJedinica);
router.post('/:id/unutrasnje-jedinice', requireRole('admin'), organController.addUnutrasnjaJedinica);
router.post('/:id/radna-mjesta', requireRole('admin'), organController.addRadnoMjestoOrganu);

export default router;
