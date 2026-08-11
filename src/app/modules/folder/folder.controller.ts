import { Request, Response } from 'express';
import { FolderServices } from './folder.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create folder
const createFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.createFolder({
    ...req.body,
    createdBy: req.user.id,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folder created successfully',
    data: result,
  });
});

// update folder
const updateFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.updateFolder(
    req.params.id as string,
    req.body,
    req.user.id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folder updated successfully',
    data: result,
  });
});

export const FolderController = {
  createFolder,
  updateFolder,
};
