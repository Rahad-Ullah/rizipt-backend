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

// delete folder
const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.deleteFolder(
    req.params.id as string,
    req.user.id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folder deleted successfully',
    data: result,
  });
});

// get single folder
const getSingleFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.getSingleFolderContents(
    req.params.id as string,
    req.user.id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folder retrieved successfully',
    data: result,
  });
});

// get my folders
const getMyFolders = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.getFoldersByUserId(req.user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folders retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const FolderController = {
  createFolder,
  updateFolder,
  deleteFolder,
  getSingleFolder,
  getMyFolders,
};
