import express from 'express';
import { RedeemController } from './redeem.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { RedeemValidations } from './redeem.validation';

const router = express.Router();

// create redeem
router.post(
  '/create',
  auth(UserRole.User),
  validateRequest(RedeemValidations.createRedeem),
  RedeemController.createRedeem,
);

// get redeem by user id
router.get(
  '/my-redeems',
  auth(UserRole.User),
  RedeemController.getRedeemByUserId,
);

// get all redeems
router.get(
  '/all',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  RedeemController.getAllRedeems,
);

export const redeemRoutes = router;
