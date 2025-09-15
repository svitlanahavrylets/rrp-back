import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'team',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, crop: 'limit' },
      { fetch_format: 'auto', quality: 'auto' },
    ],
  },
});

export const upload = multer({ storage });

export const handlePhotoInput = (req, res, next) => {
  if (req.body.photoUrl) {
    req.photoSource = 'url';
  } else if (req.file && req.file.path) {
    req.photoSource = 'file';
    req.body.cloudinaryUrl = req.file.path;
    req.body.cloudinaryPublicId = req.file.filename;
  } else {
    return res.status(400).json({
      message: 'Je nutné poskytnout photoUrl nebo soubor s fotografií.',
    });
  }
  next();
};

export const deleteCloudinaryImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑 Obrázek byl odstraněn z Cloudinary: ${publicId}`);
  } catch (err) {
    console.error('❌ Chyba při odstraňování obrázku z Cloudinary:', err);
  }
};
