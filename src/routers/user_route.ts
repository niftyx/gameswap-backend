import { UserHandler } from "../handlers/user_handler";
import * as express from "express";
import { validate } from "express-validation";
import * as asyncHandler from "express-async-handler";

import UserValidation from "../validators/user.validation";
import { UserService } from "../services/user_service";
import { CommonService } from "../services/common_service";

// tslint:disable-next-line:completed-docs
export function createUserRouter(
  userService: UserService,
  commonService: CommonService
): express.Router {
  const router = express.Router();
  const handlers = new UserHandler(userService, commonService);

  router.route("/").get(handlers.root);

  router
    .route("/all")
    .get(
      validate(UserValidation.list),
      asyncHandler(handlers.list.bind(handlers))
    );

  router
    .route("/:id/twitter/verify")
    .post(
      validate(UserValidation.verifyTwitter),
      asyncHandler(handlers.update.bind(handlers))
    );

  router
    .route("/:id")
    .get(
      validate(UserValidation.get),
      asyncHandler(handlers.get.bind(handlers))
    )
    .post(
      validate(UserValidation.update),
      asyncHandler(handlers.update.bind(handlers))
    );

  return router;
}
