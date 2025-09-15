import Joi from 'joi';

export const serviceAddSchema = Joi.object({
  title: Joi.string().trim().min(2).required(),
  text: Joi.string().trim().min(2).required(),
  description: Joi.string().trim().min(2).required(),
  imageUrl: Joi.string().uri().required(),
  cloudinaryPublicId: Joi.string().optional(),
});
