import express from 'express';
import { CustomerController } from './customer.controller';

const router = express.Router();

router.get('/', CustomerController);

export const customerRoutes = router;