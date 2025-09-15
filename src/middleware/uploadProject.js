import multer from 'multer';
import { projectStorage } from '../config/cloudinaryProjects.js';
import { v2 as cloudinary } from 'cloudinary';

export const uploadProjectImage = multer({
  storage: projectStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Nepovolený typ souboru. Povolené formáty: JPEG, PNG, WEBP'),
      );
    }
  },
});

export const handleProjectPhotoInput = (req, res, next) => {
  if (req.body.imageUrl) {
    req.photoSource = 'url';
  } else if (req.file && req.file.path) {
    req.photoSource = 'file';
    req.body.cloudinaryUrl = req.file.path;
    req.body.cloudinaryPublicId = req.file.filename;
  } else {
    return res.status(400).json({
      message: 'Je nutné poskytnout imageUrl nebo soubor s fotografií.',
    });
  }
  next();
};

export const deleteProjectImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      console.warn(
        '⚠️ Cloudinary: Obrázek nebyl odstraněn nebo již neexistuje.',
      );
    }
  } catch (error) {
    console.error('❌ Chyba při odstraňování obrázku z Cloudinary:', error);
  }
};
