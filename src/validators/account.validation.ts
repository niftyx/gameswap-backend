import { Joi } from "express-validation";

const AccountValidation = {
  // GET /accounts/v1/:id
  get: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  // POST /accounts/v1/:id
  update: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      customUrl: Joi.any(),
      bio: Joi.any(),
      twitterUsername: Joi.any(),
      personalSite: Joi.any(),
      imageUrl: Joi.any(),
      signedMessage: Joi.string().required(),
    }),
  },
  // GET /accounts/v1/all
  list: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
};

export default AccountValidation;
