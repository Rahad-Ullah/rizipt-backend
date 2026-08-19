import { Request, Response } from 'express';
import { ReceiptServices } from './receipt.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// ocr receipt ai extraction
const ocrReceiptAiExtraction = catchAsync(
  async (req: Request, res: Response) => {
    const { rawOcrText } = req.body;
    const result = await ReceiptServices.ocrReceiptAiExtraction(rawOcrText);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Receipt parsed successfully',
      data: result,
    });
  },
);

// create receipt
const createReceipt = catchAsync(async (req: Request, res: Response) => {
  const result = await ReceiptServices.createReceiptService(
    {
      ...req.body,
      createdBy: req.user.id,
    },
    req.user,
  );

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

// get single receipt
const getSingleReceipt = catchAsync(async (req: Request, res: Response) => {
  const result = await ReceiptServices.getSingleReceipt(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Receipt retrieved successfully',
    data: result,
  });
});

// get my receipts
const getMyReceipts = catchAsync(async (req: Request, res: Response) => {
  const result = await ReceiptServices.getReceiptsByUser(
    req.user.id,
    req.query,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Receipt retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

// get all receipts
const getAllReceipts = catchAsync(async (req: Request, res: Response) => {
  const result = await ReceiptServices.getAllReceipts(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Receipt retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const ReceiptController = {
  ocrReceiptAiExtraction,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getSingleReceipt,
  getMyReceipts,
  getAllReceipts,
};
