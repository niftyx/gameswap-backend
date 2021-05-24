import { Joi } from "express-validation";

const UserValidation = {
  // GET /users/v1/:id
  get: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  // POST /users/v1/:id
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
      twitterVerified: Joi.any(),
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
  // GET /users/v1/all
  list: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
  // POST /users/:id/twitter/verify
  verifyTwitter: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      username: Joi.string().required(),
    }),
  },
};

export default UserValidation;
