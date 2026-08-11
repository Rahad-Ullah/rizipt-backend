import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

// create folder validation
const createFolder = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(1, 'Name is required')
        .nonempty("Name can't be empty!"),
      parent: objectId('Parent folder ID').optional(),
    })
    .strict(),
});

// update folder validation
const updateFolder = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(1, 'Name is required')
        .nonempty("Name can't be empty!"),
      parent: objectId('Parent folder ID').optional(),
    })
    .strict(),
});

// delete folder validation
const deleteFolder = z.object({
  params: z
    .object({
      id: z.string(),
    })
    .strict(),
});

export const FolderValidations = {
  createFolder,
  updateFolder,
  deleteFolder,
};
