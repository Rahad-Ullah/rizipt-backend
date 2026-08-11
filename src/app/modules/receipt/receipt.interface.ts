import { Model, Types } from 'mongoose';
import { ReceiptStatus } from './receipt.constants';

export interface ILineItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IReceipt {
  _id?: Types.ObjectId | string;
  uid: string;
  folder: Types.ObjectId | string;
  reference?: string;
  customer?: string | Types.ObjectId;
  merchant: {
    id?: Types.ObjectId | string;
    businessName: string;
    address?: string;
    phone?: string;
  };
  lineItems: ILineItem[];
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  status: ReceiptStatus;
  createdBy: Types.ObjectId | string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReceiptModel = Model<IReceipt>;
