import { Schema, model } from 'mongoose';
import { IReceipt, ReceiptModel } from './receipt.interface';
import { ReceiptStatus } from './receipt.constants';

const receiptSchema = new Schema<IReceipt, ReceiptModel>(
  {
    uid: {
      type: String,
      unique: true,
      trim: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    reference: {
      type: String,
      trim: true,
      default: '',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    merchant: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'Merchant',
        default: null,
      },
      businessName: {
        type: String,
        trim: true,
        default: '',
      },
      address: {
        type: String,
        trim: true,
        default: '',
      },
      phone: {
        type: String,
        trim: true,
        default: '',
      },
    },
    lineItems: {
      type: [Object],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    taxPercentage: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ReceiptStatus),
      required: true,
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
  },
  {
    timestamps: true,
  },
);

export const Receipt = model<IReceipt, ReceiptModel>('Receipt', receiptSchema);
