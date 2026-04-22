import { Router } from 'express';
import * as zaposlenikController from '../controllers/zaposlenik.controller';
import { protect, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Vlastiti profil
router.get('/me', zaposlenikController.getMe);

// Admin i resursi
router.get('/', zaposlenikController.getZaposlenici);
router.get('/:id', zaposlenikController.getZaposlenik);
router.post('/', requireRole('admin'), zaposlenikController.createZaposlenik);
router.patch('/:id', requireRole('admin'), zaposlenikController.updateZaposlenik);
router.patch('/:id/dodjela', requireRole('admin'), zaposlenikController.dodjelaOrgRM);
router.delete('/:id', requireRole('admin'), zaposlenikController.deleteZaposlenik);

export default router;
