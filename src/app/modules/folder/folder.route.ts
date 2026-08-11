import express from 'express';
import { FolderController } from './folder.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { FolderValidations } from './folder.validation';

const router = express.Router();

// create folder
router.post(
  '/create',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(FolderValidations.createFolder),
  FolderController.createFolder,
);

// update folder
router.patch(
  '/:id',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(FolderValidations.updateFolder),
  FolderController.updateFolder,
);

// delete folder
router.delete(
  '/:id',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(FolderValidations.deleteFolder),
  FolderController.deleteFolder,
);

// get my folders
router.get(
  '/my-folders',
  auth(UserRole.User, UserRole.Merchant),
  FolderController.getMyFolders,
);

// get single folder
router.get(
  '/:id',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(FolderValidations.getSingleFolder),
  FolderController.getSingleFolder,
);

export const folderRoutes = router;
