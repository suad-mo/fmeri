import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth.middleware';
import { popunjenostPDF, popunjenostExcel, sistematizacijaPDF, sistematizacijaExcel } from '../controllers/izvjestaj.controller';

const router = Router();

router.use(protect);

router.get('/popunjenost/pdf', requireRole('admin'), popunjenostPDF);
router.get('/popunjenost/excel', requireRole('admin'), popunjenostExcel);
router.get('/sistematizacija/pdf', requireRole('admin'), sistematizacijaPDF);
router.get('/sistematizacija/excel', requireRole('admin'), sistematizacijaExcel);

export default router;
