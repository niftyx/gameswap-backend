import * as express from "express";
// tslint:disable-next-line:no-implicit-dependencies
import * as core from "express-serve-static-core";
import { Server } from "http";

import { AppDependencies } from "../app";
import {
  ACCOUNT_PATH,
  ASSET_PATH,
  COLLECTION_PATH,
  COMMON_PATH,
  CRYPTO_CONTENT_PATH,
  GAME_PATH,
} from "../constants";
import { rootHandler } from "../handlers/root_handler";
import { logger } from "../logger";
import { addressNormalizer } from "../middleware/address_normalizer";
import { errorHandler } from "../middleware/error_handling";
import { createAccountRouter } from "../routers/account_route";
import { createAssetRouter } from "../routers/asset_route";
import { createCollectionRouter } from "../routers/collection_route";
import { createCommonRouter } from "../routers/common_route";
import { createCryptoContentRouter } from "../routers/crypto_content_route";
import { createGameRouter } from "../routers/game_route";
// import { createSRARouter } from "../routers/sra_router";
import { HttpServiceConfig } from "../types";

import { createDefaultServer } from "./utils";

/**
 * http_service_runner hosts endpoints for staking, sra, swap and meta-txns (minus the /submit endpoint)
 * and can be horizontally scaled as needed
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
 * as well as adding orders to mesh.
 * @param dependencies If no mesh client is supplied, the HTTP service will start without it.
 *                     It will provide defaults for other params.
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

  // staking http service
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
      dependencies.assetService,
      dependencies.commonService
    )
  );

  // ACCOUNT http service
  app.use(
    ACCOUNT_PATH,
    createAccountRouter(dependencies.accountService, dependencies.commonService)
  );

  // COLLECTION http service
  app.use(
    COLLECTION_PATH,
    createCollectionRouter(dependencies.collectionService)
  );

  // ASSET http service
  app.use(ASSET_PATH, createAssetRouter(dependencies.assetService));

  // COMMON http service
  app.use(COMMON_PATH, createCommonRouter(dependencies.commonService));

  app.use(errorHandler);

  server.listen(config.httpPort);
  return {
    server,
  };
}
