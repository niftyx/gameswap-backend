import { UserHandler } from "../handlers/user_handler";
import * as express from "express";
import { validate } from "express-validation";
import * as asyncHandler from "express-async-handler";

import UserValidation from "../validators/user.validation";
import { UserService } from "../services/user_service";
import { CommonService } from "../services/common_service";

/**
 * This handles get/update/create user data
 * We should remove all GET listeners
 */

// tslint:disable-next-line:completed-docs
export function createUserRouter(
  userService: UserService,
  commonService: CommonService
): express.Router {
  const router = express.Router();
  const handlers = new UserHandler(userService, commonService);

  router.route("/").get(handlers.root);

  router
    .route("/:id/twitter/verify")
    .post(
      validate(UserValidation.verifyTwitter),
      asyncHandler(handlers.update.bind(handlers))
    );

  router
    .route("/:id")
    // update user profile
    .post(
      validate(UserValidation.update),
      asyncHandler(handlers.update.bind(handlers))
    );

  return router;
}
