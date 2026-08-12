import { Schema, model } from 'mongoose';
import { IMerchant, MerchantModel } from './merchant.interface';
import { KycStatus } from './merchant.constants';
import { autoIncrementPlugin } from '../../../DB/autoIncrementPlugin';

const merchantSchema = new Schema<IMerchant, MerchantModel>(
  {
    uid: { type: String, unique: true, sparse: true, trim: true },
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

// --- 1. Plugins ---
merchantSchema.plugin(autoIncrementPlugin, {
  incField: 'uid',
  prefix: 'MRC',
  counterId: 'merchant_sequence',
  padLength: 6,
});

// --- 2. Statics ---
merchantSchema.statics.isProfileFulfilled = function (
  merchant: Partial<IMerchant>,
): boolean {
  if (!merchant) return false;

  const hasBusinessDetails = Boolean(
    merchant.businessName?.trim() &&
    merchant.businessType?.trim() &&
    merchant.businessDescription?.trim(),
  );

  const hasContact = Boolean(
    merchant.phone?.countryCode?.trim() &&
    merchant.phone?.number?.trim() &&
    merchant.address?.trim(),
  );

  const hasDocuments = Boolean(
    merchant.tradeLicense?.trim() && merchant.logo?.trim(),
  );

  const hasValidLocation = Boolean(
    merchant.location?.coordinates &&
    merchant.location.coordinates.length === 2 &&
    (merchant.location.coordinates[0] !== 0 ||
      merchant.location.coordinates[1] !== 0),
  );

  return hasBusinessDetails && hasContact && hasDocuments;
};

// --- 3. Model Compilation (Must be last) ---
export const Merchant = model<IMerchant, MerchantModel>(
  'Merchant',
  merchantSchema,
);
