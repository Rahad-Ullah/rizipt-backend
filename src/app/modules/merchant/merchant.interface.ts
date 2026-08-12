import { Model, Types } from 'mongoose';
import { KycStatus } from './merchant.constants';

export interface IMerchant {
  _id: Types.ObjectId;
  uid: string;
  user: Types.ObjectId;
  businessName: string;
  businessType: string;
  businessDescription?: string;
  logo: string;
  tradeLicense: string;
  phone: {
    countryCode: string;
    number: string;
  };
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  kycStatus: KycStatus;
  isKycVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantModel extends Model<IMerchant> {
  isProfileFulfilled(merchant: Partial<IMerchant>): boolean;
}
