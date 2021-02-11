import { Joi } from "express-validation";

const CollectionValidation = {
  // GET /collections/v1/:id
  getCollection: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  // GET /collections/v1/all
  listCollections: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
  // POST /collections/v1/
  createCollection: {
    body: Joi.object({
      displayName: Joi.string().required(),
      description: Joi.string(),
      imageUrl: Joi.string().required(),
      shortUrl: Joi.string(),
    }),
  },
};

export default CollectionValidation;
