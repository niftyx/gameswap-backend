import { CollectionHandler } from "../handlers/collection_handler";
import * as express from "express";
import CollectionValidation from "../validators/collection.validation";
import { validate } from "express-validation";

// tslint:disable-next-line:completed-docs
export function createCollectionRouter(): express.Router {
  const router = express.Router();
  const handlers = new CollectionHandler();

  router
    .route("/")
    .get(handlers.root)
    .post(validate(CollectionValidation.createCollection), handlers.create);

  router.route("/all").get(handlers.list);

  router
    .route("/:id")
    .get(validate(CollectionValidation.getCollection), handlers.get);

  return router;
}
