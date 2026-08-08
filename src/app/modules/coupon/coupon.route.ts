import express from 'express';
import { CouponController } from './coupon.controller';

const router = express.Router();

router.get('/', CouponController);

export const couponRoutes = router;