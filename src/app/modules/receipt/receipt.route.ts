import express from 'express';
import { ReceiptController } from './receipt.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ReceiptValidations } from './receipt.validation';
import { rateLimiter } from '../../middlewares/rateLimit';

const router = express.Router();

// receipt OCR AI extraction
router.post(
  '/ocr-ai-extraction',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(ReceiptValidations.ocrReceiptAiExtraction),
  rateLimiter({ prefix: 'ocr-ai-extraction', max: 10 }),
  ReceiptController.ocrReceiptAiExtraction,
);

// create receipt
router.post(
  '/create',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(ReceiptValidations.createReceipt),
  ReceiptController.createReceipt,
);

// update receipt
router.patch(
  '/:id',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(ReceiptValidations.updateReceipt),
  ReceiptController.updateReceipt,
);

// delete receipt
router.delete(
  '/:id',
  auth(UserRole.User, UserRole.Merchant),
  validateRequest(ReceiptValidations.deleteReceipt),
  ReceiptController.deleteReceipt,
);

// get single receipt
router.get(
  '/single/:id',
  auth(UserRole.User, UserRole.Merchant, UserRole.Admin, UserRole.SuperAdmin),
  validateRequest(ReceiptValidations.getSingleReceipt),
  ReceiptController.getSingleReceipt,
);

// get my receipts
router.get(
  '/my-receipts',
  auth(UserRole.User, UserRole.Merchant),
  ReceiptController.getMyReceipts,
);

// get all receipts
router.get(
  '/all',
  auth(UserRole.Admin, UserRole.SuperAdmin),
  ReceiptController.getAllReceipts,
);

export const receiptRoutes = router;
