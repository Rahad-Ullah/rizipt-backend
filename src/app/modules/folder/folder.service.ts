import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IFolder } from './folder.interface';
import { Folder } from './folder.model';
import { get, Types } from 'mongoose';
import { toObjectId } from '../../../utils/toObjectId';
import QueryBuilder from '../../builder/QueryBuilder';
import { Receipt } from '../receipt/receipt.model';

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

// --------------- update folder service ---------------
const updateFolder = async (
  folderId: Types.ObjectId | string,
  payload: Partial<IFolder>,
  userId: Types.ObjectId | string,
): Promise<IFolder> => {
  // 1. Fetch current target folder
  const currentFolder = await Folder.findOne({
    _id: folderId,
    createdBy: userId,
    isDeleted: false,
  });

  if (!currentFolder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
  }

  const isParentChanging =
    payload.parent !== undefined &&
    String(payload.parent ?? null) !== String(currentFolder.parent ?? null);

  const targetName = payload.name ?? currentFolder.name;
  const targetParent = isParentChanging ? payload.parent : currentFolder.parent;

  // 2. Prevent illegal moves (moving folder into itself)
  if (isParentChanging && String(payload.parent) === String(folderId)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Cannot set a folder as its own parent',
    );
  }

  // 3. Compute new ancestors if folder is moving
  let newAncestors: Types.ObjectId[] = currentFolder.ancestors;

  if (isParentChanging) {
    if (payload.parent) {
      const newParentFolder = await Folder.findOne({
        _id: payload.parent,
        createdBy: userId,
        isDeleted: false,
      });

      if (!newParentFolder) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          'Target parent folder not found',
        );
      }

      // Prevent moving folder into one of its own subfolders (circular dependency)
      const isTargetInsideChild = newParentFolder.ancestors.some(
        id => String(id) === String(folderId),
      );

      if (isTargetInsideChild) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Cannot move a folder inside one of its own subfolders',
        );
      }

      newAncestors = [...newParentFolder.ancestors, newParentFolder._id];
    } else {
      // Moving to root level
      newAncestors = [];
    }
  }

  // 4. Duplicate name check in destination folder
  if (payload.name || isParentChanging) {
    const existingFolder = await Folder.exists({
      _id: { $ne: folderId },
      name: targetName,
      parent: targetParent || null,
      createdBy: userId,
      isDeleted: false,
    });

    if (existingFolder) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'A folder with this name already exists in the target directory',
      );
    }
  }

  // 5. Apply updates to target folder
  currentFolder.name = targetName;
  if (isParentChanging) {
    currentFolder.parent = targetParent ? toObjectId(targetParent) : null;
    currentFolder.ancestors = newAncestors;
  }

  const updatedFolder = await currentFolder.save();

  // 6. Bulk update subtree ancestors if the folder was moved
  if (isParentChanging) {
    const oldAncestors = currentFolder.ancestors; // Pre-move ancestors path
    const oldPrefixLength = oldAncestors.length + 1; // Ancestor depth threshold

    // Find all nested descendants using the ancestors array index
    const subfolders = await Folder.find({
      ancestors: folderId,
      isDeleted: false,
    });

    // Replace the old ancestor chain prefix with the new ancestor chain prefix
    if (subfolders.length > 0) {
      const bulkOps = subfolders.map(doc => {
        const updatedSubtreeAncestors = [
          ...newAncestors,
          currentFolder._id,
          ...doc.ancestors.slice(oldPrefixLength),
        ];

        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { ancestors: updatedSubtreeAncestors } },
          },
        };
      });

      if (bulkOps.length > 0) {
        await Folder.bulkWrite(bulkOps);
      }
    }

    // Optional: Also update receipt/coupon documents inside this folder tree
    // await Receipt.updateMany(...);
  }

  return updatedFolder;
};

// --------------- delete folder service ---------------
const deleteFolder = async (
  folderId: Types.ObjectId | string,
  userId: Types.ObjectId | string,
): Promise<{ deletedCount: number }> => {
  // 1. Verify target folder exists and belongs to user
  const targetFolder = await Folder.findOne({
    _id: folderId,
    createdBy: userId,
    isDeleted: false,
  });

  if (!targetFolder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
  }

  // 2. Fetch all subfolder IDs inside the target folder tree
  const subfolders = await Folder.find({
    ancestors: folderId,
    createdBy: userId,
    isDeleted: false,
  }).select('_id');

  const allAffectedFolderIds = [
    targetFolder._id,
    ...subfolders.map(f => f._id),
  ];

  // 3. Soft-delete target folder AND all nested subfolders
  const folderResult = await Folder.updateMany(
    {
      _id: { $in: allAffectedFolderIds },
    },
    {
      $set: { isDeleted: true },
    },
  );

  // 4. Soft-delete receipts belonging to the target folder or any subfolder
  await Receipt.updateMany(
    {
      folder: { $in: allAffectedFolderIds },
      createdBy: userId,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
  );

  return { deletedCount: folderResult.modifiedCount };
};

// ----------------- get folder by id service ----------------
const getSingleFolderContents = async (
  folderId: Types.ObjectId | string | null,
  userId: Types.ObjectId | string,
) => {
  let currentFolder: IFolder | null = null;
  let breadcrumbs: IFolder[] = [];

  if (folderId) {
    // 1. Fetch current folder details
    currentFolder = await Folder.findOne({
      _id: folderId,
      createdBy: userId,
      isDeleted: false,
    });

    if (!currentFolder) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
    }

    // 2. Resolve breadcrumbs using ancestors array (1 query for all ancestors)
    if (currentFolder.ancestors.length > 0) {
      breadcrumbs = await Folder.find({
        _id: { $in: currentFolder.ancestors },
        isDeleted: false,
      })
        .select('_id name parent')
        .lean();

      // Ensure breadcrumbs follow the array order of ancestors
      const ancestorMap = new Map(
        breadcrumbs.map(doc => [String(doc._id), doc]),
      );
      breadcrumbs = currentFolder.ancestors
        .map(id => ancestorMap.get(String(id)))
        .filter((doc): doc is IFolder => doc !== undefined);
    }
  }

  // 3. Fetch subfolders in the target directory
  const folders = await Folder.find({
    parent: folderId || null,
    createdBy: userId,
    isDeleted: false,
  })
    .sort({ name: 1 })
    .lean();

  return {
    currentFolder,
    breadcrumbs,
    folders,
  };
};

// --------------- get folders by user id service ---------------
const getFoldersByUserId = async (userId: Types.ObjectId | string) => {
  const folderQuery = new QueryBuilder(
    Folder.find({ createdBy: userId, isDeleted: false }),
    {},
  )
    .filter()
    .search(['name'])
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    folderQuery.modelQuery,
    folderQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const FolderServices = {
  createFolder,
  updateFolder,
  deleteFolder,
  getSingleFolderContents,
  getFoldersByUserId,
};
