import { MediaUpload } from './mediaUpload.model';

// -------------- upload media --------------
const uploadMedia = async (urls: string[]) => {
  if (!urls || urls.length === 0) return [];

  const mediaDocs = urls.map(url => ({ url }));

  const result = await MediaUpload.insertMany(mediaDocs);
  return result;
};

export const MediaUploadServices = {
  uploadMedia,
};
