import { Request, Response } from 'express';
import { FolderServices } from './folder.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

// create folder
const createFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.createFolder({
    ...req.body,
    createdBy: req.user.id,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Folder created successfully',
    data: result,
  });
});

export const FolderController = {
  createFolder,
};
