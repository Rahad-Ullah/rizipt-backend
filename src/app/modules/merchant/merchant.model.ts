import { Schema, model } from 'mongoose';
import { IMerchant, MerchantModel } from './merchant.interface';
import { KycStatus } from './merchant.constants';

const merchantSchema = new Schema<IMerchant, MerchantModel>(
  {
    uid: { type: String, unique: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, default: '' },
    businessType: { type: String, default: '' },
    businessDescription: { type: String, default: '' },
    logo: { type: String, default: '' },
    tradeLicense: { type: String, default: '' },
    phone: {
      countryCode: { type: String, default: '' },
      number: { type: String, default: '' },
    },
    address: { type: String, default: '' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      },
    },
    kycStatus: {
      type: String,
      enum: Object.values(KycStatus),
      default: KycStatus.Pending,
    },
    isKycVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const Merchant = model<IMerchant, MerchantModel>(
  'Merchant',
  merchantSchema,
);
