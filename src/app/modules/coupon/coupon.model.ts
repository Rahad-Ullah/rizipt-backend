import { Schema, model } from 'mongoose';
import { ICoupon, CouponModel } from './coupon.interface';
import { CouponStatus } from './coupon.constants';
import { autoIncrementPlugin } from '../../../DB/autoIncrementPlugin';

const couponSchema = new Schema<ICoupon, CouponModel>({
  uid: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  image: {
    type: String,
    required: true,
  },
  redeemCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(CouponStatus),
    default: CouponStatus.Active,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

export const Coupon = model<ICoupon, CouponModel>('Coupon', couponSchema);

// auto increment uid
couponSchema.plugin(autoIncrementPlugin, {
  incField: 'uid',
  prefix: 'CPN',
  counterId: 'coupon_sequence',
  padLength: 6,
});