import { Joi } from "express-validation";

const GameValidation = {
  // POST /games/v1/:id
  updateGame: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.any(),
      imageUrl: Joi.string().required(),
      headerImageUrl: Joi.any(),
      version: Joi.string().required(),
      categoryId: Joi.string().required(),
      platform: Joi.any(),
      message: Joi.string().required(), // to validate and get address of creator
    }),
  },

  // POST /games/v1/
  createGame: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.any(),
      imageUrl: Joi.string().required(),
      headerImageUrl: Joi.any(),
      version: Joi.string().required(),
      categoryId: Joi.string().required(),
      platform: Joi.any(),
      customUrl: Joi.any(),
      message: Joi.string().required(), // to validate and get address of creator
    }),
  },
};

export default GameValidation;
