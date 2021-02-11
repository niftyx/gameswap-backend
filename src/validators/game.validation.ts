import { Joi } from "express-validation";

const GameValidation = {
  // GET /games/v1/:id
  getGame: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  // GET /games/v1/all
  listGames: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
  // POST /games/v1/
  createGame: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string(),
      imageUrl: Joi.string().required(),
      version: Joi.string(),
      categoryId: Joi.string(),
      platform: Joi.object(),
      message: Joi.string().required(), // to validate and get address of creator
    }),
  },
};

export default GameValidation;
