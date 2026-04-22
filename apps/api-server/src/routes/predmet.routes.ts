import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import {
  getPredmeti,
  getPredmet,
  createPredmet,
  updatePredmet,
  deletePredmet,
  addAkt,
  updateAkt,
  deleteAkt,
} from '../controllers/predmet.controller';

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

export default router;
