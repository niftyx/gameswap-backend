import * as express from "express";
import { Server } from "http";
import { Connection } from "typeorm";

import {
  CHAIN_ID,
  CONTENT_SECRET_KEY,
  EXCHANGE_CONTRACT_BLOCK,
  LOGGER_INCLUDE_TIMESTAMP,
  LOG_LEVEL,
} from "./config";
import { getDBConnectionAsync } from "./db_connection";

import { runHttpServiceAsync } from "./runners/http_service_runner";
import { HttpServiceConfig } from "./types";
import * as pino from "pino";
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
import { getContractAddressesForChainOrThrow } from "./custom/contract-addresses";
import { CommonService } from "./services/common_service";

export const logger = pino({
  level: LOG_LEVEL,
  useLevelLabels: true,
  timestamp: LOGGER_INCLUDE_TIMESTAMP,
});

export interface AppDependencies {
  connection: Connection; // db service
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
  const connection = await getDBConnectionAsync();

  const collectionService = new CollectionService(connection);
  const collectionHistoryService = new CollectionHistoryService(connection);
  const gameService = new GameService(connection);
  const cryptoContentService = new CryptoContentService(CONTENT_SECRET_KEY);
  const userService = new UserService(connection);
  const assetService = new AssetService(connection);
  const assetHistoryService = new AssetHistoryService(connection);
  const commonService = new CommonService(connection);

  const contractAddresses = getContractAddressesForChainOrThrow(CHAIN_ID);
  const exchangeService = new ExchangeService(
    contractAddresses.exchange,
    EXCHANGE_CONTRACT_BLOCK,
    connection,
    assetService,
    assetHistoryService
  );

  const factoryService = new FactoryService(
    connection,
    _config.factoryContractAddress,
    _config.factoryBlockNumber,
    collectionService,
    collectionHistoryService,
    userService,
    assetService,
    assetHistoryService,
    gameService,
    contractAddresses.exchange
  );

  return {
    connection,
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
    const contractAddresses = getContractAddressesForChainOrThrow(CHAIN_ID);
    await dependencies.factoryService.listenERC721Contracts(); // list collection creation
    const erc721Contracts = await dependencies.collectionService.list(1, 100);
    for (let index = 0; index < erc721Contracts.records.length; index++) {
      const element = erc721Contracts.records[index];
      // listens to events of a certain collection (asset mint, transfer, burn and transferOwnership of collection)
      const erc721Service = new ERC721Service(
        element.address,
        element.block,
        dependencies.connection,
        dependencies.collectionService,
        dependencies.collectionHistoryService,
        dependencies.userService,
        dependencies.assetService,
        dependencies.assetHistoryService,
        dependencies.gameService,
        contractAddresses.exchange
      );
      await erc721Service.listenAssets();
    }
  } catch (e) {
    logger.error(
      `Error attempting to start ERC721 Factory service, [${JSON.stringify(e)}]`
    );
  }
  // listen

  return { app, server };
}
