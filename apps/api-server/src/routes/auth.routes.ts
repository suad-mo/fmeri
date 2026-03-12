import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Zaštićena ruta (samo za test)
router.get('/me', protect, (req, res) => {
  // Pošto smo koristili 'protect', ovdje imamo pristup req.user
  res.json({ message: 'Ovo su zaštićeni podaci', user: (req as any).user });
});

export default router;
