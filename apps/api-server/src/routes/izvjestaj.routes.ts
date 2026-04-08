import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth.middleware';
import { popunjenostPDF, popunjenostExcel } from '../controllers/izvjestaj.controller';

const router = Router();

router.use(protect);

router.get('/popunjenost/pdf', requireRole('admin'), popunjenostPDF);
router.get('/popunjenost/excel', requireRole('admin'), popunjenostExcel);

export default router;
