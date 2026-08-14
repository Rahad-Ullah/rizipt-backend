import express from 'express';
import { MerchantController } from './merchant.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { MerchantValidations } from './merchant.validation';

const router = express.Router();

// update merchant profile
router.patch(
  '/profile',
  auth(UserRole.Merchant),
  validateRequest(MerchantValidations.updateMerchantProfileSchema),
  MerchantController.updateMerchantProfile,
);

// update merchant kyc status
router.patch(
  '/kyc/:id',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  validateRequest(MerchantValidations.updateMerchantKycStatusSchema),
  MerchantController.updateMerchantKycStatus,
);

// get my merchant
router.get(
  '/profile',
  auth(UserRole.Merchant),
  MerchantController.getMyMerchant,
);

export const merchantRoutes = router;
