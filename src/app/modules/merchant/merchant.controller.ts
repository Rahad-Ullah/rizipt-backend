import { Request, Response } from 'express';
import { MerchantServices } from './merchant.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';

// update merchant profile
const updateMerchantProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MerchantServices.updateMerchantProfile(
      req.user.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Merchant profile updated successfully',
      data: result,
    });
  },
);

// update merchant kyc status
const updateMerchantKycStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MerchantServices.updateMerchantKycStatus(
      req.params.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Merchant KYC status updated successfully',
      data: result,
    });
  },
);

export const MerchantController = {
  updateMerchantProfile,
  updateMerchantKycStatus,
};
