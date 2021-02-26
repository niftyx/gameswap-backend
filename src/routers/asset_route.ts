import * as express from "express";
import AssetValidation from "../validators/asset.validation";
import { validate } from "express-validation";
import * as asyncHandler from "express-async-handler";

import { AssetService } from "../services/asset_service";
import { AssetHandler } from "../handlers/asset_handler";

// tslint:disable-next-line:completed-docs
export function createAssetRouter(assetService: AssetService): express.Router {
  const router = express.Router();
  const handlers = new AssetHandler(assetService);

  router.route("/").get(handlers.root);

  router
    .route("/all")
    .get(
      validate(AssetValidation.list),
      asyncHandler(handlers.list.bind(handlers))
    );

  router
    .route("/address/:id")
    .get(
      validate(AssetValidation.listByAddress),
      asyncHandler(handlers.listByAddress.bind(handlers))
    );

  router
    .route("/collection/:collectionId/asset/:assetId")
    .get(
      validate(AssetValidation.getByCollectionIdAndAssetId),
      asyncHandler(handlers.getByCollectionIdAndAssetId.bind(handlers))
    );

  router
    .route("/:id")
    .get(
      validate(AssetValidation.get),
      asyncHandler(handlers.get.bind(handlers))
    );

  return router;
}