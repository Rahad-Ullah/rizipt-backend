import { Schema, model } from 'mongoose';
import { IRedeem, RedeemModel } from './redeem.interface';

const redeemSchema = new Schema<IRedeem, RedeemModel>(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

export const Redeem = model<IRedeem, RedeemModel>('Redeem', redeemSchema);
