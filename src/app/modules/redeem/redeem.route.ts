import express from 'express';
import { RedeemController } from './redeem.controller';

const router = express.Router();

router.get('/', RedeemController);

export const redeemRoutes = router;