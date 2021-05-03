import { CommonHandler } from "../handlers/common_handler";
import * as express from "express";
import { validate } from "express-validation";
import * as asyncHandler from "express-async-handler";

import CommonValidation from "../validators/common.validation";
import { CommonService } from "../services/common_service";

export function createCommonRouter(
  commonService: CommonService
): express.Router {
  const router = express.Router();
  const handlers = new CommonHandler(commonService);

  router.route("/").get(handlers.root);

  router
    .route("/check-custom-url-usable")
    .post(
      validate(CommonValidation.customUrlRequest),
      asyncHandler(handlers.checkCustomUrlUsable.bind(handlers))
    );

  router
    .route("/custom-url-info")
    .post(
      validate(CommonValidation.customUrlRequest),
      asyncHandler(handlers.checkCustomUrlUsable.bind(handlers))
    );

  return router;
}
