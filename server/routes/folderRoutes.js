import { Router } from 'express';
import * as Folder from '../controllers/folderController.js';
import { requireAuthApi } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuthApi);

router.get('/', Folder.listFolders);
router.post('/', Folder.createFolder);
router.put('/:id/rename', Folder.renameFolder);
router.put('/:id/move', Folder.moveFolder);
router.delete('/:id', Folder.deleteFolder);

export default router;
