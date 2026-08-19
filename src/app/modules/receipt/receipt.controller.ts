import { Request, Response } from 'express';
import { ReceiptServices } from './receipt.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import { redis } from '../../../config/redis';
import ApiError from '../../../errors/ApiError';

// ocr receipt ai extraction
const ocrReceiptAiExtraction = catchAsync(
  async (req: Request, res: Response) => {
    const { rawOcrText } = req.body;
    const userId = req.user.id;

    // create lock key to avoid race conditions (multiple requests at the same time)
    const textHash = crypto
      .createHash('sha256')
      .update(rawOcrText.trim())
      .digest('hex');
    const lockKey = `lock:ocr_extraction:${userId}:${textHash}`;

    // acquire atomic lock (expire in 30 seconds)
    const acquired = await redis.set(lockKey, 'IN_PROGRESS', 'EX', 30, 'NX');
    if (!acquired) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Receipt is already being processed. Please wait.',
      );
    }

    const result = await ReceiptServices.ocrReceiptAiExtraction(rawOcrText);

    // Always release the lock when done
    await redis.del(lockKey);

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
    req.user,
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
