import express from 'express';
import { ReceiptController } from './receipt.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ReceiptValidations } from './receipt.validation';

const router = express.Router();

// create receipt
router.post(
  '/create',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(ReceiptValidations.createReceipt),
  ReceiptController.createReceipt,
);

export const receiptRoutes = router;
