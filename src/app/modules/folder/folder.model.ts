import { Schema, model } from 'mongoose';
import { IFolder, FolderModel } from './folder.interface';

const folderSchema = new Schema<IFolder, FolderModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    ancestors: {
      type: [Schema.Types.ObjectId],
      ref: 'Folder',
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Folder = model<IFolder, FolderModel>('Folder', folderSchema);
