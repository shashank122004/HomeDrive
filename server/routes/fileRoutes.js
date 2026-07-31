import { Router } from 'express';
import * as File from '../controllers/fileController.js';
import * as Favorite from '../controllers/favoriteController.js';
import { requireAuthApi } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
router.use(requireAuthApi);

router.get('/', File.listFiles);
router.get('/recent', File.recentFiles);
router.get('/search', File.searchFiles);
router.get('/storage', File.storageUsed);
router.get('/trash', File.listTrash);
router.get('/favorites', Favorite.listFavorites);
router.post('/upload', upload.single('file'), File.uploadFile);
router.get('/:id/download', File.downloadFile);
router.get('/:id/preview', File.previewFile);
router.put('/:id/rename', File.renameFile);
router.put('/:id/move', File.moveFile);
router.post('/:id/trash', File.trashFile);
router.post('/:id/restore', File.restoreFile);
router.delete('/:id', File.deleteFilePermanently);
router.post('/:id/favorite', Favorite.addFavorite);
router.delete('/:id/favorite', Favorite.removeFavorite);

export default router;
