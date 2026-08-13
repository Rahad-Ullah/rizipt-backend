import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';

const router = express.Router();

// get merchant overview
router.get(
  '/overview/merchant',
  auth(UserRole.Merchant),
  AnalyticsController.getMerchantOverview,
);

// get admin overview
router.get(
    '/overview/admin',
    auth(UserRole.Admin, UserRole.SuperAdmin),
    AnalyticsController.getAdminOverview
);

// get monthly user growth
router.get(
    '/monthly-users-growth',
    auth(UserRole.Admin, UserRole.SuperAdmin),
    AnalyticsController.getMonthlyUserGrowth
);

export const analyticsRoutes = router;