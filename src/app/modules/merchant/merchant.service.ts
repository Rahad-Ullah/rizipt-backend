import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IMerchant } from './merchant.interface';
import { Merchant } from './merchant.model';
import { KycStatus } from './merchant.constants';
import deleteS3File from '../../../shared/deleteS3File';
import { MediaUploadServices } from '../mediaUpload/mediaUpload.service';

// update merchant profile
const updateMerchantProfile = async (userId: string, payload: Partial<IMerchant>) => {
  // check if merchant exists
  const existingMerchant = await Merchant.findOne({ user: userId });
  if (!existingMerchant) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Merchant not found');
  }

  // handle kyc status
  if (payload.tradeLicense) {
    payload.kycStatus = KycStatus.Pending;
  }

  const updatedMerchant = await Merchant.findOneAndUpdate(
    { user: userId },
    { $set: payload },
    { new: true, upsert: true },
  );

  // delete old files and mark new files
  if (payload.logo) {
    await MediaUploadServices.markMediaAsUsed(payload.logo);
    if (existingMerchant.logo && payload.logo !== existingMerchant.logo) {
      await deleteS3File(existingMerchant.logo);
    }
  }
  
  if (payload.tradeLicense) {
    await MediaUploadServices.markMediaAsUsed(payload.tradeLicense);
    if (
      existingMerchant.tradeLicense &&
      payload.tradeLicense !== existingMerchant.tradeLicense
    ) {
      await deleteS3File(existingMerchant.tradeLicense);
    }
  }
  return updatedMerchant;
};

// update merchant kyc status
const updateMerchantKycStatus = async (
  userId: string,
  payload: Partial<IMerchant>,
) => {
  // handle kyc flag
  if (payload.kycStatus === KycStatus.Approved) {
    payload.isKycVerified = true;
  } else if (payload.kycStatus === KycStatus.Rejected) {
    payload.isKycVerified = false;
  }

  const updatedMerchant = await Merchant.findOneAndUpdate(
    { user: userId },
    { $set: payload },
    { new: true },
  );
  if (!updatedMerchant) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Merchant not found');
  }
  return updatedMerchant;
};

export const MerchantServices = {
  updateMerchantProfile,
  updateMerchantKycStatus,
};
