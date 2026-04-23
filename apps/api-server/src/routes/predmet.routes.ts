import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  getPredmeti,
  getPredmet,
  createPredmet,
  updatePredmet,
  deletePredmet,
  addAkt,
  updateAkt,
  deleteAkt,
  uploadAktFajl,
} from '../controllers/predmet.controller';

// Multer konfiguracija za akte
const uploadDir = path.join(__dirname, '../../../../../uploads/akti');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const dozvoljeni = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];
    if (dozvoljeni.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Dozvoljeni formati: PDF, JPG, PNG, DOC, DOCX'));
    }
  },
});

const router = Router();

router.use(protect);

router.get('/', getPredmeti);
router.get('/:id', getPredmet);
router.post('/', createPredmet);
router.patch('/:id', updatePredmet);
router.delete('/:id', deletePredmet);

router.post('/:id/akti', addAkt);
router.patch('/:id/akti/:aktId', updateAkt);
router.delete('/:id/akti/:aktId', deleteAkt);

// Upload fajla za akt
router.post('/:id/akti/:aktId/fajl', upload.single('fajl'), uploadAktFajl);

export default router;
