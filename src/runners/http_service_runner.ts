import * as express from "express";
// tslint:disable-next-line:no-implicit-dependencies
import * as core from "express-serve-static-core";
import { Server } from "http";

import { AppDependencies } from "../app";
import { CRYPTO_CONTENT_PATH } from "../constants";
import { rootHandler } from "../handlers/root_handler";
import { logger } from "../logger";
import { addressNormalizer } from "../middleware/address_normalizer";
import { errorHandler } from "../middleware/error_handling";
import { createCryptoContentRouter } from "../routers/crytpo_content_route";
// import { createSRARouter } from "../routers/sra_router";
import { WebsocketService } from "../services/websocket_service";
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
  wsService?: WebsocketService;
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
  app.use(CRYPTO_CONTENT_PATH, createCryptoContentRouter());

  // SRA http service
  // app.use(SRA_PATH, createSRARouter(dependencies.orderBookService));

  app.use(errorHandler);

  // websocket service
  // let wsService: WebsocketService;
  // if (dependencies.meshClient) {
  //   // tslint:disable-next-line:no-unused-expression
  //   wsService = new WebsocketService(
  //     server,
  //     dependencies.meshClient,
  //     dependencies.websocketOpts
  //   );
  // } else {
  //   logger.error(`Could not establish mesh connection, exiting`);
  //   process.exit(1);
  // }
  server.listen(config.httpPort);
  return {
    server,
    // wsService,
  };
}
