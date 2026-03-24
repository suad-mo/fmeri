import { Router, Request, Response } from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '@nx-fmeri/api-auth';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);   // ← novo
router.post('/logout', authController.logout);     // ← novo

// router.get('/me', protect, (req: Request, res: Response) => {
//   res.json({ message: 'Ovo su zaštićeni podaci', user: req.user });
// });

router.get('/me', protect, (req, res) => {
  res.json({ message: 'Ovo su zaštićeni podaci', user: (req as any).user });
});

export default router;
