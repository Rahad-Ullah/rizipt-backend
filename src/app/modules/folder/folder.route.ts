import express from 'express';
import { FolderController } from './folder.controller';

const router = express.Router();

router.get('/', FolderController);

export const folderRoutes = router;