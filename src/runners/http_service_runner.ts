import * as express from "express";
// tslint:disable-next-line:no-implicit-dependencies
import * as core from "express-serve-static-core";
import { Server } from "http";

import { AppDependencies } from "../app";
import {
  USER_PATH,
  COMMON_PATH,
  CRYPTO_CONTENT_PATH,
  GAME_PATH,
} from "../constants";
import { rootHandler } from "../handlers/root_handler";
import { logger } from "../logger";
import { addressNormalizer } from "../middleware/address_normalizer";
import { errorHandler } from "../middleware/error_handling";
import { createUserRouter } from "../routers/user_route";
import { createCommonRouter } from "../routers/common_route";
import { createCryptoContentRouter } from "../routers/crypto_content_route";
import { createGameRouter } from "../routers/game_route";
// import { createSRARouter } from "../routers/sra_router";
import { HttpServiceConfig } from "../types";

import { createDefaultServer } from "./utils";

/**
 * http_service_runner hosts endpoints for games/contents/collections/assets/users/
 */

process.on("uncaughtException", (err) => {
  logger.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  if (err) {
    logger.error(err);
  }
});

export interface HttpServices {
  server: Server;
}

/**
 * This service handles the HTTP requests. This involves fetching from the database
 */
export async function runHttpServiceAsync(
  dependencies: AppDependencies,
  config: HttpServiceConfig,
  _app?: core.Express
): Promise<HttpServices> {
  const app = _app || express();
  const server = createDefaultServer(dependencies, config, app);

  app.get("/", rootHandler);
  server.on("error", (err) => {
    logger.error(err);
  });

  // transform all values of `req.query.[xx]Address` to lowercase
  app.use(addressNormalizer);

  // crypto content http service: it will encrypt/decrypt signedContentData with crypto algorithem
  app.use(
    CRYPTO_CONTENT_PATH,
    createCryptoContentRouter(
      dependencies.cryptoContentService,
      dependencies.assetService
    )
  );

  // GAME http service
  app.use(
    GAME_PATH,
    createGameRouter(
      dependencies.gameService,
      dependencies.commonService,
      dependencies.userService
    )
  );

  // USER http service
  app.use(
    USER_PATH,
    createUserRouter(dependencies.userService, dependencies.commonService)
  );

  // COMMON http service: this check if custom-url is not used on games or users before
  app.use(COMMON_PATH, createCommonRouter(dependencies.commonService));

  app.use(errorHandler);

  server.listen(config.httpPort);
  return {
    server,
  };
}
