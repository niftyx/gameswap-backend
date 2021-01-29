import { GameHandler } from "../handlers/game_handler";
import * as express from "express";

// tslint:disable-next-line:completed-docs
export function createGameRouter(): express.Router {
  const router = express.Router();
  const handlers = new GameHandler();

  router.route("/").get(handlers.root).post(handlers.create);

  router.route("/all").get(handlers.list);

  router.route("/:id").get(handlers.get);

  return router;
}
