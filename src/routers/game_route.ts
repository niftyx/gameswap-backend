import { GameHandler } from "../handlers/game_handler";
import * as express from "express";
import { GameService } from "../services/game_service";
import * as asyncHandler from "express-async-handler";
import { validate } from "express-validation";
import GameValidation from "../validators/game.validation";
import { CommonService } from "../services/common_service";
import { UserService } from "../services/user_service";

/**
 * This handles create/get/update GAME items
 * We should remove all GET listeners
 */
// tslint:disable-next-line:completed-docs
export function createGameRouter(
  gameService: GameService,
  commonService: CommonService,
  userService: UserService
): express.Router {
  const router = express.Router();
  const handlers = new GameHandler(gameService, commonService, userService);

  router
    .route("/")
    .get(handlers.root)
    .post(
      validate(GameValidation.createGame),
      asyncHandler(handlers.create.bind(handlers))
    );

  router
    .route("/:id")
    .post(
      validate(GameValidation.updateGame),
      asyncHandler(handlers.update.bind(handlers))
    );

  return router;
}
