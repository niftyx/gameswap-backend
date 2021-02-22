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
};

export default CollectionValidation;
