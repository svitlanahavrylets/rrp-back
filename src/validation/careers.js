import Joi from 'joi';

export const careerAddSchema = Joi.object({
  title: Joi.string().trim().min(2).required(),
  text: Joi.string().trim().min(2).required(),
  description: Joi.string().trim().min(2).required(),
});
