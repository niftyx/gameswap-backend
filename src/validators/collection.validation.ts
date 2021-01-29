import Joi = require("joi");

const CollectionValidation = {
  // GET /collections/v1/:id
  getCollection: {
    params: {
      id: Joi.string().required(),
    },
  },
  // GET /collections/v1/all
  listCollections: {},
  // POST /collections/v1/
  createCollection: {
    body: {
      displayName: Joi.string().required(),
      description: Joi.string(),
      imageUrl: Joi.string().required(),
      shortUrl: Joi.string(),
    },
  },
};

export default CollectionValidation;
