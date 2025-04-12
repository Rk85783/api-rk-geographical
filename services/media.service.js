import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadMultipleMedia = async (files, { userId, role }) => {
  try {
    const uploadPromises = files.map(file =>
      cloudinary.uploader.upload(file.path, {
        folder: `rk-geographical/${role}/${userId}`,
        // public_id: file.filename
      })
    );
    const results = await Promise.all(uploadPromises);
    return results.map(result => ({ url: result.secure_url, publicId: result.public_id }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deleteMedia = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId =>
      cloudinary.uploader.destroy(publicId)
    );
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error(error);
    return [];
  }
};


