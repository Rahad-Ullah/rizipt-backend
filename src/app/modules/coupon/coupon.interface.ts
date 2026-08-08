import { Model, Types } from 'mongoose';
import { CouponStatus } from './coupon.constants';

export interface ICoupon {
  _id: Types.ObjectId;
  uid: string;
  title: string;
  description: string;
  code: string;
  discountPercentage: number;
  image: string;
  redeemCount: number;
  expiresAt: Date;
  status: CouponStatus;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
}

export type CouponModel = Model<ICoupon>;
