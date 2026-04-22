import { Router } from 'express';
import { protect, requireRole } from '../middlewares/auth.middleware';
import {
  popunjenostPDF,
  popunjenostExcel,
  sistematizacijaPDF,
  sistematizacijaExcel,
  getPregledStrukture,
  pregledPDF,
  pregledExcel,
} from '../controllers/izvjestaj.controller';

const router = Router();

router.use(protect);

router.get('/popunjenost/pdf', requireRole('admin'), popunjenostPDF);
router.get('/popunjenost/excel', requireRole('admin'), popunjenostExcel);
router.get('/sistematizacija/pdf', requireRole('admin'), sistematizacijaPDF);
router.get(
  '/sistematizacija/excel',
  requireRole('admin'),
  sistematizacijaExcel,
);
router.get('/pregled', requireRole('admin'), getPregledStrukture);
router.get('/pregled/pdf', requireRole('admin'), pregledPDF);
router.get('/pregled/excel', requireRole('admin'), pregledExcel);

export default router;
