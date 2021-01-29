import { AccountHandler } from "../handlers/account_handler";
import * as express from "express";

// tslint:disable-next-line:completed-docs
export function createAccountRouter(): express.Router {
  const router = express.Router();
  const handlers = new AccountHandler();

  router.route("/").get(handlers.root).post(handlers.create);

  router.route("/all").get(handlers.list);

  router.route("/:id").get(handlers.get);

  return router;
}
