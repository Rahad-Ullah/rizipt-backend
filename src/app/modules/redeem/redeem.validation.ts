import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

// create redeem
const createRedeem = z.object({
  body: z
    .object({
      coupon: objectId('Coupon ID'),
    })
    .strict(),
});

export const RedeemValidations = {
  createRedeem,
};
