import { Joi } from "express-validation";

const GameValidation = {
  // GET /games/v1/:id
  get: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
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
  // GET /games/v1/all
  list: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
  // GET /games/v1/search
  search: {
    query: Joi.object({
      keyword: Joi.any(),
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

  // GET /games/v1/:id/assets
  listAssetsRelated: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
};

export default GameValidation;
