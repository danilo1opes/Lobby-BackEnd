import { Router } from 'express';
import {
  createPhoto,
  getPhotos,
  getPhoto,
  deletePhoto,
} from '../controllers/photoController';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/', authMiddleware, uploadMiddleware.single('image'), createPhoto);
router.get('/', getPhotos);
router.get('/:id', getPhoto);
router.delete('/:id', authMiddleware, deletePhoto);

export default router;
