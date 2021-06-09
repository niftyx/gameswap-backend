import * as express from "express";
import { Server } from "http";

import {
  CONTENT_SECRET_KEY,
  EXCHANGE_CONTRACT,
  EXCHANGE_CONTRACT_BLOCK,
} from "./config";

import { runHttpServiceAsync } from "./runners/http_service_runner";
import { HttpServiceConfig } from "./types";
import { CollectionService } from "./services/collection_service";
import { CryptoContentService } from "./services/crypto_content_service";
import { GameService } from "./services/game_service";
import { FactoryService } from "./services/factory_service";
import { UserService } from "./services/user_service";
import { AssetHistoryService } from "./services/asset_history_service";
import { CollectionHistoryService } from "./services/collection_history_service";
import { AssetService } from "./services/asset_service";
import { ERC721Service } from "./services/erc721_service";
import { ExchangeService } from "./services/exchange_service";
import { CommonService } from "./services/common_service";
import { logger } from "./logger";

export interface AppDependencies {
  cryptoContentService: CryptoContentService; // encrypt/decrypt signedContentData with crypto algorithm
  factoryService: FactoryService; // handles "CollectionCreation" or "CollectionOwnershipTransfer"
  userService: UserService;
  assetService: AssetService;
  assetHistoryService: AssetHistoryService;
  collectionService: CollectionService;
  collectionHistoryService: CollectionHistoryService;
  gameService: GameService;
  exchangeService: ExchangeService; // handles "OrderFilled" or "OrderCancelled" events of 0x exchange contract
  commonService: CommonService;
}

/**
 * Instantiates dependencies required to run the app. Uses default settings based on config
 */
export async function getDefaultAppDependenciesAsync(
  _config: HttpServiceConfig
): Promise<AppDependencies> {
  const collectionService = new CollectionService();
  const collectionHistoryService = new CollectionHistoryService();
  const gameService = new GameService();
  const cryptoContentService = new CryptoContentService(CONTENT_SECRET_KEY);
  const userService = new UserService();
  const assetService = new AssetService();
  const assetHistoryService = new AssetHistoryService();
  const commonService = new CommonService();

  const exchangeService = new ExchangeService(
    EXCHANGE_CONTRACT,
    EXCHANGE_CONTRACT_BLOCK,
    assetService,
    assetHistoryService
  );

  const factoryService = new FactoryService(
    _config.factoryContractAddress,
    _config.factoryBlockNumber,
    collectionService,
    collectionHistoryService,
    userService,
    assetService,
    assetHistoryService,
    gameService,
    EXCHANGE_CONTRACT
  );

  return {
    collectionService,
    collectionHistoryService,
    cryptoContentService,
    gameService,
    factoryService,
    userService,
    assetService,
    assetHistoryService,
    exchangeService,
    commonService,
  };
}
/**
 * starts the app with dependencies injected.
 * @return the app object
 */
export async function getAppAsync(
  dependencies: AppDependencies,
  config: HttpServiceConfig
): Promise<{ app: Express.Application; server: Server }> {
  const app = express();
  const { server } = await runHttpServiceAsync(dependencies, config, app);

  // list contracts
  try {
    dependencies.factoryService.listenERC721Contracts(); // list collection creation
    let allSet = false;
    let totalCount = 0;
    let limit = 100;

    while (!allSet) {
      const erc721Contracts = await dependencies.collectionService.listForSync(
        totalCount,
        limit
      );
      totalCount = totalCount + erc721Contracts.length;
      if (erc721Contracts.length < limit) {
        allSet = true;
      }
      for (let index = 0; index < erc721Contracts.length; index++) {
        const element = erc721Contracts[index];
        // listens to events of a certain collection (asset mint, transfer, burn and transferOwnership of collection)
        const erc721Service = new ERC721Service(
          element.address,
          element.block,
          dependencies.collectionService,
          dependencies.collectionHistoryService,
          dependencies.userService,
          dependencies.assetService,
          dependencies.assetHistoryService,
          dependencies.gameService,
          EXCHANGE_CONTRACT
        );
        erc721Service.listenAssets();
      }
    }
  } catch (e) {
    logger.error(
      `Error attempting to start ERC721 Factory service, [${JSON.stringify(e)}]`
    );
  }
  // listen

  return { app, server };
}
