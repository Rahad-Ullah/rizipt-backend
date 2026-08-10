import deleteS3File from '../../../shared/deleteS3File';
import { MediaUpload } from './mediaUpload.model';

// -------------- upload media --------------
const uploadMedia = async (urls: string[]) => {
  if (!urls || urls.length === 0) return [];

  const mediaDocs = urls.map(url => ({ url }));

  const result = await MediaUpload.insertMany(mediaDocs);
  return result;
};

// -------------- delete/cleanup media --------------
const deleteJunkMediaFiles = async (): Promise<void> => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const junkMediaFiles = await MediaUpload.find({
    createdAt: { $lt: twentyFourHoursAgo },
  });

  if (!junkMediaFiles.length) return;

  for (const media of junkMediaFiles) {
    try {
      await deleteS3File(media.url);
      await MediaUpload.findByIdAndDelete(media._id);
    } catch (error) {
      console.error(`[Media Cleanup Error] ID: ${media._id}`, error);
    }
  }
};

export const MediaUploadServices = {
  uploadMedia,
  deleteJunkMediaFiles,
};
