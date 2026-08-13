import { Model, Types } from 'mongoose';

export interface IRedeem {
  _id: string;
  coupon: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type RedeemModel = Model<IRedeem>;
