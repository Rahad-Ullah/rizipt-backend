import { Model, Types } from 'mongoose';

export interface ICustomer {
  _id: Types.ObjectId;
  uid: string;
  name: string;
  email: string;
}

export type CustomerModel = Model<ICustomer>;
