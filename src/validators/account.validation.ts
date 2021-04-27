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
      headerImageUrl: Joi.any(),
      bio: Joi.any(),
      twitterUsername: Joi.any(),
      twitchUsername: Joi.any(),
      facebookUsername: Joi.any(),
      youtubeUsername: Joi.any(),
      instagramUsername: Joi.any(),
      tiktokUsername: Joi.any(),
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
  // POST /accounts/:id/twitter/verify
  verifyTwitter: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      username: Joi.string().required(),
    }),
  },
};

export default AccountValidation;
