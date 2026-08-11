import { Request, Response } from 'express';
import { ReceiptServices } from './receipt.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create receipt
const createReceipt = catchAsync(async (req: Request, res: Response) => {
  const result = await ReceiptServices.createReceiptService({
    ...req.body,
    createdBy: req.user.id,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Receipt created successfully',
    data: result,
  });
});

export const ReceiptController = {
  createReceipt,
};
