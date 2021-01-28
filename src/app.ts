import {
  AssetSwapperContractAddresses,
  BRIDGE_ADDRESSES_BY_CHAIN,
  ContractAddresses,
} from "@0x/asset-swapper";
import { getContractAddressesForChainOrThrow } from "@0x/contract-addresses";
import * as express from "express";
import { Server } from "http";
import { Connection } from "typeorm";

import { CHAIN_ID, LOGGER_INCLUDE_TIMESTAMP, LOG_LEVEL } from "./config";
import { getDBConnectionAsync } from "./db_connection";

import { runHttpServiceAsync } from "./runners/http_service_runner";
import { ChainId, HttpServiceConfig } from "./types";
import * as pino from "pino";
//import { runOrderWatcherServiceAsync } from "./runners/order_watcher_service_runner";
export const logger = pino({
  level: LOG_LEVEL,
  useLevelLabels: true,
  timestamp: LOGGER_INCLUDE_TIMESTAMP,
});

export interface AppDependencies {
  contractAddresses: ContractAddresses;
  connection: Connection;
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
  const bridgeAddresses = BRIDGE_ADDRESSES_BY_CHAIN[chainId];
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

  return {
    contractAddresses,
    connection,
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
  // try {
  //   await runOrderWatcherServiceAsync(
  //     dependencies.connection,
  //     dependencies.meshClient
  //   );
  // } catch (e) {
  //   logger.error(
  //     `Error attempting to start Order Watcher service, [${JSON.stringify(e)}]`
  //   );
  // }
  // Register a shutdown event listener.
  // TODO: More teardown logic should be added here. For example, the mesh rpc
  // client should be destroyed and services should be torn down.
  // server.on("close", async () => {
  //   await wsService.destroyAsync();
  // });

  return { app, server };
}
