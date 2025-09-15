import Joi from 'joi';

export const aboutAddSchema = Joi.object({
  text: Joi.string().allow('').optional(),
  youtubeLink: Joi.string().uri().allow('').optional(),
  imageUrl: Joi.string().uri().optional(),
  cloudinaryPublicId: Joi.string().optional(),
});
