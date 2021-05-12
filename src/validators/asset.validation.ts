import { Joi } from "express-validation";

const AssetValidation = {
  // GET /assets/v1/:id
  get: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
  // GET /assets/v1/collection/:collectionId/asset/:assetId
  getByCollectionIdAndAssetId: {
    params: Joi.object({
      collectionId: Joi.string().required(),
      assetId: Joi.string().required(),
    }),
  },
  // GET /assets/v1/all
  list: {
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
      orderBy: Joi.any(),
      orderDir: Joi.any(),
      collectionId: Joi.any(),
      gameId: Joi.any(),
      categoryId: Joi.any(),
      ownerId: Joi.any(),
      creatorId: Joi.any(),
    }),
  },
  listByOwner: {
    params: Joi.object({
      id: Joi.string().required(),
    }),
    query: Joi.object({
      perPage: Joi.number().greater(0),
      page: Joi.number().min(1),
    }),
  },
  // GET /assets/v1/:id/history
  getHistory: {
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
