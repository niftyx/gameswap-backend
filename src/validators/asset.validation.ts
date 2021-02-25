import { Joi } from "express-validation";

const AssetValidation = {
  // GET /assets/v1/:id
  get: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  // GET /assets/v1/all
  list: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
  listByAddress: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
};

export default AssetValidation;
