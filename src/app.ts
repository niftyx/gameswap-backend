import {
  AssetSwapperContractAddresses,
  ContractAddresses,
} from "@0x/asset-swapper";
import { getContractAddressesForChainOrThrow } from "./custom/contract-addresses";
import * as express from "express";
import { Server } from "http";
import { Connection } from "typeorm";

import {
  CHAIN_ID,
  CONTENT_SECRET_KEY,
  LOGGER_INCLUDE_TIMESTAMP,
  LOG_LEVEL,
} from "./config";
import { getDBConnectionAsync } from "./db_connection";

import { runHttpServiceAsync } from "./runners/http_service_runner";
import { ChainId, HttpServiceConfig } from "./types";
import * as pino from "pino";
import { CollectionService } from "./services/collection_service";
import { CryptoContentService } from "./services/crypto_content_service";
import { GameService } from "./services/game_service";
import { FactoryService } from "./services/factory_service";
import { AccountService } from "./services/account_service";
import { AssetHistoryService } from "./services/asset_history_service";
import { CollectionHistoryService } from "./services/collection_history_service";
import { AssetService } from "./services/asset_service";
import { OrderService } from "./services/order_service";
import { ERC721Service } from "./services/erc721_service";
//import { runOrderWatcherServiceAsync } from "./runners/order_watcher_service_runner";
export const logger = pino({
  level: LOG_LEVEL,
  useLevelLabels: true,
  timestamp: LOGGER_INCLUDE_TIMESTAMP,
});

export interface AppDependencies {
  contractAddresses: ContractAddresses;
  connection: Connection;
  cryptoContentService: CryptoContentService;
  factoryService: FactoryService;
  accountService: AccountService;
  assetService: AssetService;
  assetHistoryService: AssetHistoryService;
  collectionService: CollectionService;
  collectionHistoryService: CollectionHistoryService;
  gameService: GameService;
  orderService: OrderService;
}

let contractAddresses_: AssetSwapperContractAddresses | undefined;

/**
 * Determines the contract addresses needed for the network. For testing (ganache)
 * required contracts are deployed
 * @param provider provider to the network, used for ganache deployment
 * @param chainId the network chain id
 */
export async function getContractAddressesForNetworkOrThrowAsync(
  chainId: ChainId
): Promise<AssetSwapperContractAddresses> {
  if (contractAddresses_) {
    return contractAddresses_;
  }
  let contractAddresses = getContractAddressesForChainOrThrow(chainId);
  const bridgeAddresses = {
    uniswapBridge: exports.NULL_ADDRESS,
    uniswapV2Bridge: exports.NULL_ADDRESS,
    eth2DaiBridge: exports.NULL_ADDRESS,
    kyberBridge: exports.NULL_ADDRESS,
    curveBridge: exports.NULL_ADDRESS,
    multiBridge: exports.NULL_ADDRESS,
    balancerBridge: exports.NULL_ADDRESS,
    bancorBridge: exports.NULL_ADDRESS,
    mStableBridge: exports.NULL_ADDRESS,
    mooniswapBridge: exports.NULL_ADDRESS,
    sushiswapBridge: exports.NULL_ADDRESS,
    shellBridge: exports.NULL_ADDRESS,
    dodoBridge: exports.NULL_ADDRESS,
    creamBridge: exports.NULL_ADDRESS,
    snowswapBridge: exports.NULL_ADDRESS,
    swerveBridge: exports.NULL_ADDRESS,
    cryptoComBridge: exports.NULL_ADDRESS,
  };
  // In a testnet where the environment does not support overrides
  // so we deploy the latest sampler
  contractAddresses_ = { ...contractAddresses, ...bridgeAddresses };
  return contractAddresses_;
}

/**
 * Instantiates dependencies required to run the app. Uses default settings based on config
 * @param _config should contain a URI for mesh to listen to, and the ethereum RPC URL
 */
export async function getDefaultAppDependenciesAsync(
  _config: HttpServiceConfig
): Promise<AppDependencies> {
  const contractAddresses = await getContractAddressesForNetworkOrThrowAsync(
    CHAIN_ID
  );
  const connection = await getDBConnectionAsync();

  const collectionService = new CollectionService(connection);
  const collectionHistoryService = new CollectionHistoryService(connection);
  const gameService = new GameService(connection);
  const cryptoContentService = new CryptoContentService(CONTENT_SECRET_KEY);
  const accountService = new AccountService(connection);
  const assetService = new AssetService(connection);
  const assetHistoryService = new AssetHistoryService(connection);
  const orderService = new OrderService(connection);
  const factoryService = new FactoryService(
    connection,
    _config.factoryContractAddress,
    _config.factoryBlockNumber,
    collectionService,
    collectionHistoryService,
    accountService,
    assetService,
    assetHistoryService,
    orderService,
    gameService
  );

  return {
    contractAddresses,
    connection,
    collectionService,
    collectionHistoryService,
    cryptoContentService,
    gameService,
    factoryService,
    accountService,
    assetService,
    assetHistoryService,
    orderService,
  };
}
/**
 * starts the app with dependencies injected. This entry-point is used when running a single instance 0x API
 * deployment and in tests. It is not used in production deployments where scaling is required.
 * @param dependencies  all values are optional and will be filled with reasonable defaults, with one
 *                      exception. if a `meshClient` is not provided, the API will start without a
 *                      connection to mesh.
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
    await dependencies.factoryService.listenERC721Contracts();
    const erc721Contracts = await dependencies.collectionService.list(1, 100);
    for (let index = 0; index < erc721Contracts.records.length; index++) {
      const element = erc721Contracts.records[index];
      const erc721Service = new ERC721Service(
        element.address,
        element.block,
        dependencies.connection,
        dependencies.collectionService,
        dependencies.collectionHistoryService,
        dependencies.accountService,
        dependencies.assetService,
        dependencies.assetHistoryService,
        dependencies.orderService,
        dependencies.gameService
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
