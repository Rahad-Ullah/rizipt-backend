import { Request, Response } from 'express';
import { RedeemServices } from './redeem.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create redeem
const createRedeem = catchAsync(async (req: Request, res: Response) => {
  const result = await RedeemServices.createRedeem({
    ...req.body,
    user: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Redeem created successfully',
    data: result,
  });
});

// get redeem by user id
const getRedeemByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await RedeemServices.getRedeemByUserId(req.user.id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Redeem retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const RedeemController = {
  createRedeem,
  getRedeemByUserId,
};
