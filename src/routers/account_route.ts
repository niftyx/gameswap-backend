import { AccountHandler } from "../handlers/account_handler";
import * as express from "express";
import { validate } from "express-validation";
import * as asyncHandler from "express-async-handler";

import AccountValidation from "../validators/account.validation";
import { AccountService } from "../services/account_service";

// tslint:disable-next-line:completed-docs
export function createAccountRouter(
  accountService: AccountService
): express.Router {
  const router = express.Router();
  const handlers = new AccountHandler(accountService);

  router.route("/").get(handlers.root);

  router
    .route("/all")
    .get(
      validate(AccountValidation.list),
      asyncHandler(handlers.list.bind(handlers))
    );

  router
    .route("/:id/twitter/verify")
    .post(
      validate(AccountValidation.verifyTwitter),
      asyncHandler(handlers.update.bind(handlers))
    );

  router
    .route("/:id")
    .get(
      validate(AccountValidation.get),
      asyncHandler(handlers.get.bind(handlers))
    )
    .post(
      validate(AccountValidation.update),
      asyncHandler(handlers.update.bind(handlers))
    );

  return router;
}
