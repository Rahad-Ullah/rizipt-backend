import express from 'express';
import { CustomerController } from './customer.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { CustomerValidations } from './customer.validation';

const router = express.Router();

// create customer
router.post(
  '/create',
  auth(UserRole.Merchant),
  validateRequest(CustomerValidations.createCustomer),
  CustomerController.createCustomer,
);

// update customer
router.patch(
  '/:id',
  auth(UserRole.Merchant),
  validateRequest(CustomerValidations.updateCustomer),
  CustomerController.updateCustomer,
);

export const customerRoutes = router;
