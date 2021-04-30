import { GameHandler } from "../handlers/game_handler";
import * as express from "express";
import { GameService } from "../services/game_service";
import * as asyncHandler from "express-async-handler";
import { validate } from "express-validation";
import GameValidation from "../validators/game.validation";
import { AssetService } from "../services/asset_service";

// tslint:disable-next-line:completed-docs
export function createGameRouter(
  gameService: GameService,
  assetService: AssetService
): express.Router {
  const router = express.Router();
  const handlers = new GameHandler(gameService, assetService);

  router
    .route("/")
    .get(handlers.root)
    .post(
      validate(GameValidation.createGame),
      asyncHandler(handlers.create.bind(handlers))
    );

  router
    .route("/all")
    .get(
      validate(GameValidation.list),
      asyncHandler(handlers.list.bind(handlers))
    );

  router
    .route("/:id/assets")
    .get(
      validate(GameValidation.listAssetsRelated),
      asyncHandler(handlers.listAssetsRelated.bind(handlers))
    );

  router
    .route("/:id")
    .get(
      validate(GameValidation.get),
      asyncHandler(handlers.update.bind(handlers))
    )
    .post(validate(GameValidation.updateGame));

  return router;
}
