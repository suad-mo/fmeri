import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, requireRole } from '../middlewares/auth.middleware';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
// import { createUser, resetLozinka, updateRole } from '../controllers/user.controller';

// Multer konfiguracija
// user.routes.ts — uploadDir
const uploadDir = path.join(__dirname, '../../../../../uploads/slike');
console.log('Upload dir:', uploadDir);
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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const dozvoljeni = ['image/jpeg', 'image/png', 'image/webp'];
    if (dozvoljeni.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Dozvoljeni formati: JPEG, PNG, WebP'));
    }
  },
});

const router = Router();

router.use(protect);

// Vlastiti profil
router.get('/me', userController.getMe);
router.patch('/me/lozinka', userController.promijeniLozinku);
router.post('/me/slika', upload.single('slika'), userController.uploadSlika);

// Admin
router.get('/', requireRole('admin'), userController.getUsers);
router.patch('/:id/dodjela', requireRole('admin'), userController.dodjelaOrgRM);

router.post('/', requireRole('admin'), userController.createUser);
router.patch('/:id/role', requireRole('admin'), userController.updateRole);
router.patch('/:id/reset-lozinka', requireRole('admin'), userController.resetLozinka);
router.patch('/:id/zaposlenik', requireRole('admin'), userController.poveziZaposlenika);

export default router;
