import express from 'express';
import { CouponController } from './coupon.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { CouponValidations } from './coupon.validation';

const router = express.Router();

// create coupon
router.post(
  '/create',
  auth(UserRole.Merchant),
  validateRequest(CouponValidations.createCouponSchema),
  CouponController.createCoupon,
);

// update coupon
router.patch(
  '/:id',
  auth(UserRole.Merchant),
  validateRequest(CouponValidations.updateCouponSchema),
  CouponController.updateCoupon,
);

// delete coupon
router.delete(
  '/:id',
  auth(UserRole.Merchant, UserRole.Admin, UserRole.SuperAdmin),
  validateRequest(CouponValidations.deleteCouponSchema),
  CouponController.deleteCoupon,
);

// get single coupon
router.get(
  '/single/:id',
  auth(),
  validateRequest(CouponValidations.getCouponSchema),
  CouponController.getCoupon,
);

// get my coupons
router.get(
  '/my-coupons',
  auth(UserRole.Merchant),
  CouponController.getMyCoupons,
);

// get all coupons
router.get(
  '/all',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  CouponController.getAllCoupons,
);

export const couponRoutes = router;
