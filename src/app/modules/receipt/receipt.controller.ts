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

// update receipt
const updateReceipt = catchAsync(async (req: Request, res: Response) => {
  const result = await ReceiptServices.updateReceiptService(
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Receipt updated successfully',
    data: result,
  });
});

// delete receipt
const deleteReceipt = catchAsync(async (req: Request, res: Response) => {
  const result = await ReceiptServices.deleteReceiptService(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Receipt deleted successfully',
    data: result,
  });
});

export const ReceiptController = {
  createReceipt,
  updateReceipt,
  deleteReceipt,
};
