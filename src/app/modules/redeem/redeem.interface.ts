import { Model, Types } from 'mongoose';
import { RedeemStatus } from './redeem.constants';

export interface IRedeem {
  _id: string;
  coupon: Types.ObjectId;
  user: Types.ObjectId;
  status: RedeemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type RedeemModel = Model<IRedeem>;
