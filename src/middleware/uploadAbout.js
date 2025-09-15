import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const aboutStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'about',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }],
  },
});

export const uploadAboutImage = multer({
  storage: aboutStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nepovolený typ souboru. Povoleno: JPEG, PNG, WEBP'));
    }
  },
});

export const handleAboutImage = (req, res, next) => {
  if (req.file && req.file.path) {
    req.body.imageUrl = req.file.path;
    req.body.cloudinaryPublicId = req.file.filename;
  }

  next();
};

export const deleteAboutImage = async (publicId) => {
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      console.log('✅ Obrázek úspěšně odstraněn.');
      return true;
    } else if (result.result === 'not found') {
      console.warn('⚠️ Obrázek nenalezen — mohl být odstraněn dříve.');
      return false;
    } else {
      console.warn('⚠️ Neznámá odpověď od Cloudinary:', result);
      return false;
    }
  } catch (err) {
    console.error('❌ Chyba při odstraňování obrázku z Cloudinary:', err);
    return false;
  }
};
