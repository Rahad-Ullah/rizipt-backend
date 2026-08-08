import { Request, Response } from 'express';
import { MediaUploadServices } from './mediaUpload.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

// upload media
const uploadMedia = catchAsync(async (req: Request, res: Response) => {
  const images = getMultipleFilesPath(req.files, 'image') || [];
  const videos = getMultipleFilesPath(req.files, 'media') || [];
  const docs = getMultipleFilesPath(req.files, 'doc') || [];
  const filePaths = [...images, ...videos, ...docs];

  await MediaUploadServices.uploadMedia(filePaths);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'File uploaded successfully',
    data: filePaths,
  });
});

export const MediaUploadController = {
  uploadMedia,
};
