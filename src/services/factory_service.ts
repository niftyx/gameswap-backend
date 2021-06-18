import axios from "axios";
import { Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import * as _ from "lodash";
import { logger } from "../logger";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import { LOG_PAGE_COUNT } from "../constants";
import { ICollection, IERC721ContractInfo } from "../types";
import { ZERO_NUMBER } from "../utils/number";
import { UserService } from "./user_service";
import { AssetHistoryService } from "./asset_history_service";
import { AssetService } from "./asset_service";
import { CollectionHistoryService } from "./collection_history_service";
import { CollectionService } from "./collection_service";
import { ERC721Service } from "./erc721_service";
import { GameService } from "./game_service";

const abi = [
  "event CollectionCreated(address indexed tokenAddress,string name,string symbol,string url,string gameId,bool isPrivate)",
];

export class FactoryService {
  private readonly _factoryAddress: string;
  private readonly _factoryBlockNumber: number;
  private readonly collectionService: CollectionService;
  private readonly userService: UserService;
  private readonly collectionHistoryService: CollectionHistoryService;
  private readonly assetService: AssetService;
  private readonly assetHistoryService: AssetHistoryService;
  private readonly gameService: GameService;
  private readonly exchangeAddress: string;

  constructor(
    factoryAddress: string,
    _factoryBlockNumber: number,
    collectionService: CollectionService,
    collectionHistoryService: CollectionHistoryService,
    userService: UserService,
    assetService: AssetService,
    assetHistoryService: AssetHistoryService,
    gameService: GameService,
    exchangeAddress: string
  ) {
    this._factoryAddress = factoryAddress;
    this._factoryBlockNumber = _factoryBlockNumber;
    this.collectionService = collectionService;
    this.collectionHistoryService = collectionHistoryService;
    this.userService = userService;
    this.assetService = assetService;
    this.assetHistoryService = assetHistoryService;
    this.gameService = gameService;
    this.exchangeAddress = exchangeAddress;
  }

  async resetRelatedTables() {
    logger.info("==== reset tables start ====");
    await this.assetHistoryService.deleteAll();

    logger.info("====AssetHistoryEntity Removed====");
    await this.assetService.deleteAll();
    logger.info("====AssetEntity Removed====");
    await this.collectionHistoryService.deleteAll();
    logger.info("====GameCollectionEntity Removed====");
    await this.collectionService.deleteAll();
    logger.info("====CollectionEntity Removed====");
  }

  async syncERC721Contracts(): Promise<IERC721ContractInfo[]> {
    const provider = new ethers.providers.JsonRpcProvider(
      defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl,
      CHAIN_ID
    );
    const iface = new Interface(abi);
    const ens = new Contract(this._factoryAddress, iface, provider);

    const erc721Contracts: IERC721ContractInfo[] = [];

    logger.info(
      "======================= ERC721 Factory Sync Start ======================"
    );

    const latestBlockNumber = await provider.getBlockNumber();

    let currentScannedBlockNumber = this._factoryBlockNumber - 1;

    while (currentScannedBlockNumber < latestBlockNumber) {
      let filter: any = ens.filters.CollectionCreated();
      filter.fromBlock = currentScannedBlockNumber + 1;
      filter.toBlock = currentScannedBlockNumber + LOG_PAGE_COUNT + 1;
      filter.toBlock = Math.min(filter.toBlock, latestBlockNumber);

      const logs = await provider.getLogs(filter);

      for (let index = 0; index < logs.length; index++) {
        const log = logs[index];

        const blockNumber = log.blockNumber;
        const block = await provider.getBlock(blockNumber);
        const parsed = iface.parseLog(log);

        const infoUrl = parsed.args[3];
        let info: any;
        try {
          info = (await axios.get(infoUrl)).data || {};
        } catch (error) {
          info = {};
        }
        const gameId = parsed.args[4];
        const ownerId = String(log.address).toLowerCase();

        // upsert user
        await this.userService.upsert(ownerId, block.timestamp);

        const collection: ICollection = {
          id: String(parsed.args[0]).toLowerCase(),
          block: log.blockNumber,
          address: String(parsed.args[0]).toLowerCase(),
          name: parsed.args[1],
          symbol: parsed.args[2],
          image_url: info.imageUrl || "",
          description: info.description || "",
          is_private: parsed.args[5],
          owner_id: ownerId,
          total_supply: ZERO_NUMBER,
          total_minted: ZERO_NUMBER,
          total_burned: ZERO_NUMBER,
          create_time_stamp: block.timestamp,
          update_time_stamp: block.timestamp,
          game_id: gameId,
          is_verified: false,
          is_premium: false,
          is_featured: false,
        };
        // collections <=> games many-to-many
        logger.info(`===collection=created=${collection.address}==`);

        await this.createCollection(collection);

        erc721Contracts.push({
          address: collection.address,
          block: collection.block,
        });
      }

      currentScannedBlockNumber =
        currentScannedBlockNumber + 1 + LOG_PAGE_COUNT;
    }

    logger.info(
      "======================= ERC721 Factory Sync End ========================="
    );

    return erc721Contracts;
  }

  listenERC721Contracts() {
    const provider = new ethers.providers.JsonRpcProvider(
      defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl,
      CHAIN_ID
    );
    const iface = new Interface(abi);
    const ens = new Contract(this._factoryAddress, iface, provider);

    ens.on(
      "CollectionCreated",
      async (
        tokenAddress: string,
        name: string,
        symbol: string,
        infoUrl: string,
        gameId: string,
        isPrivate: boolean,
        log: ethers.providers.Log
      ) => {
        logger.info(`=== new collection ${tokenAddress} ${name} ${symbol} ===`);
        const blockNumber = log.blockNumber;
        const block = await provider.getBlock(blockNumber);

        let info: any;
        try {
          info = (await axios.get(infoUrl)).data || {};
        } catch (error) {
          info = {};
        }

        const owner = String(log.address).toLowerCase();

        const collection: ICollection = {
          id: String(tokenAddress).toLowerCase(),
          block: log.blockNumber,
          address: String(tokenAddress).toLowerCase(),
          name,
          symbol,
          image_url: info.imageUrl || "",
          description: info.description || "",
          is_private: isPrivate,
          owner_id: owner,
          total_supply: ZERO_NUMBER,
          total_minted: ZERO_NUMBER,
          total_burned: ZERO_NUMBER,
          create_time_stamp: block.timestamp,
          update_time_stamp: block.timestamp,
          is_verified: false,
          is_featured: false,
          is_premium: false,
          game_id: gameId,
        };

        await this.createCollection(collection);

        const erc721Service = new ERC721Service(
          collection.address,
          collection.block,
          this.collectionService,
          this.collectionHistoryService,
          this.userService,
          this.assetService,
          this.assetHistoryService,
          this.gameService,
          this.exchangeAddress
        );

        await erc721Service.listenAssets();
      }
    );
  }

  private async createCollection(collection: ICollection) {
    await this.collectionService.add(collection);
  }
}
