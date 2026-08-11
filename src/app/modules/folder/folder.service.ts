import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IFolder } from './folder.interface';
import { Folder } from './folder.model';
import { Types } from 'mongoose';

// --------------- create folder service ---------------
const createFolder = async (payload: IFolder): Promise<IFolder> => {
  let ancestors: Types.ObjectId[] = [];

  // 1. Resolve and compute full ancestor path from the parent document
  if (payload.parent) {
    const parentFolder = await Folder.findOne({
      _id: payload.parent,
      isDeleted: false,
      createdBy: payload.createdBy,
    });

    if (!parentFolder) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Parent folder not found');
    }

    // Inherit parent's ancestors and append immediate parent
    ancestors = [...parentFolder.ancestors, parentFolder._id];
  }

  payload.ancestors = ancestors;

  // 2. Check for duplicate name in the same parent directory
  const existingFolder = await Folder.exists({
    name: payload.name,
    parent: payload.parent || null,
    createdBy: payload.createdBy,
    isDeleted: false,
  });

  if (existingFolder) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Folder name already exists in this directory.',
    );
  }

  // 3. Persist document
  const result = await Folder.create(payload);
  return result;
};

export const FolderServices = {
  createFolder,
};
