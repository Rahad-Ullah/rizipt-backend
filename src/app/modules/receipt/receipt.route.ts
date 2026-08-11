import express from 'express';
import { ReceiptController } from './receipt.controller';

const router = express.Router();

router.get('/', ReceiptController);

export const receiptRoutes = router;