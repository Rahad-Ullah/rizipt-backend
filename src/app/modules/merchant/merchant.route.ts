import express from 'express';
import { MerchantController } from './merchant.controller';

const router = express.Router();

router.get('/', MerchantController);

export const merchantRoutes = router;