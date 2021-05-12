import { Joi } from "express-validation";

const CollectionValidation = {
  // GET /collections/v1/:id
  get: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  // GET /collections/v1/all
  list: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
  // GET /collections/v1/search
  search: {
    query: Joi.object({
      keyword: Joi.any(),
    }),
  },
  // GET /collections/v1/games/:id
  listRelatedToGame: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
};

export default CollectionValidation;
