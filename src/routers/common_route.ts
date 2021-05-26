import { CommonHandler } from "../handlers/common_handler";
import * as express from "express";
import { validate } from "express-validation";
import * as asyncHandler from "express-async-handler";

import CommonValidation from "../validators/common.validation";
import { CommonService } from "../services/common_service";

/**
 * Common Service
 * CustomUrl: game and users can have customUrl
 */

export function createCommonRouter(
  commonService: CommonService
): express.Router {
  const router = express.Router();
  const handlers = new CommonHandler(commonService);

  router.route("/").get(handlers.root);

  /**
   * Check if custom url is valid (not used by others yet)
   */
  router
    .route("/check-custom-url-usable")
    .post(
      validate(CommonValidation.customUrlRequest),
      asyncHandler(handlers.checkCustomUrlUsable.bind(handlers))
    );

  /**
   *  get game or user of a certain custom-url
   */
  router
    .route("/custom-url-info")
    .post(
      validate(CommonValidation.customUrlRequest),
      asyncHandler(handlers.getCustomUrlInfo.bind(handlers))
    );

  return router;
}
