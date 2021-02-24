import { CollectionHandler } from "../handlers/collection_handler";
import * as express from "express";
import CollectionValidation from "../validators/collection.validation";
import { validate } from "express-validation";
import * as asyncHandler from "express-async-handler";

import { CollectionService } from "../services/collection_service";

// tslint:disable-next-line:completed-docs
export function createCollectionRouter(
  collectionService: CollectionService
): express.Router {
  const router = express.Router();
  const handlers = new CollectionHandler(collectionService);

  router.route("/").get(handlers.root);

  router
    .route("/all")
    .get(
      validate(CollectionValidation.list),
      asyncHandler(handlers.list.bind(handlers))
    );

  router
    .route("/:id")
    .get(
      validate(CollectionValidation.get),
      asyncHandler(handlers.get.bind(handlers))
    );

  return router;
}
