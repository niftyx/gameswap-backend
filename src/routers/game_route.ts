import { GameHandler } from "../handlers/game_handler";
import * as express from "express";
import { GameService } from "../services/game_service";
import * as asyncHandler from "express-async-handler";
import { validate } from "express-validation";
import GameValidation from "../validators/game.validation";

// tslint:disable-next-line:completed-docs
export function createGameRouter(gameService: GameService): express.Router {
  const router = express.Router();
  const handlers = new GameHandler(gameService);

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
    .route("/:id")
    .get(
      validate(GameValidation.get),
      asyncHandler(handlers.get.bind(handlers))
    );

  return router;
}
