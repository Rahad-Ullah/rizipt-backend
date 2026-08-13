import { Schema, model } from 'mongoose';
import { IRedeem, RedeemModel } from './redeem.interface';
import { RedeemStatus } from './redeem.constants';

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
    status: {
      type: String,
      enum: Object.values(RedeemStatus),
      default: RedeemStatus.Pending,
    },
  },
  { timestamps: true },
);

redeemSchema.index({ coupon: 1, user: 1 }, { unique: true });

export const Redeem = model<IRedeem, RedeemModel>('Redeem', redeemSchema);
