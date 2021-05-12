import axios from "axios";
import { Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import * as _ from "lodash";
import { Connection } from "typeorm";
import { logger } from "../app";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import { LOG_PAGE_COUNT } from "../constants";
import {
  AccountEntity,
  AssetEntity,
  AssetHistoryEntity,
  CollectionEntity,
  CollectionHistoryEntity,
} from "../entities";
import { ICollection, IERC721ContractInfo } from "../types";
import { collectionUtils } from "../utils/collection_utils";
import { ZERO_NUMBER } from "../utils/number";
import { AccountService } from "./account_service";
import { AssetHistoryService } from "./asset_history_service";
import { AssetService } from "./asset_service";
import { CollectionHistoryService } from "./collection_history_service";
import { CollectionService } from "./collection_service";
import { ERC721Service } from "./erc721_service";
import { GameService } from "./game_service";
import * as isValidUUID from "uuid-validate";

const abi = [
  "event CollectionCreated(address indexed tokenAddress,string name,string symbol,string url,bool isPrivate)",
];

export class FactoryService {
  private readonly _factoryAddress: string;
  private readonly _factoryBlockNumber: number;
  private readonly _connection: Connection;
  private readonly _collectionService: CollectionService;
  private readonly _accountService: AccountService;
  private readonly _collectionHistoryService: CollectionHistoryService;
  private readonly _assetService: AssetService;
  private readonly _assetHistoryService: AssetHistoryService;
  private readonly gameService: GameService;
  private readonly _exchangeAddress: string;

  constructor(
    _connection: Connection,
    factoryAddress: string,
    _factoryBlockNumber: number,
    _collectionService: CollectionService,
    _collectionHistoryService: CollectionHistoryService,
    _accountService: AccountService,
    _assetService: AssetService,
    _assetHistoryService: AssetHistoryService,
    gameService: GameService,
    _exchangeAddress: string
  ) {
    this._connection = _connection;
    this._factoryAddress = factoryAddress;
    this._factoryBlockNumber = _factoryBlockNumber;
    this._collectionService = _collectionService;
    this._collectionHistoryService = _collectionHistoryService;
    this._accountService = _accountService;
    this._assetService = _assetService;
    this._assetHistoryService = _assetHistoryService;
    this.gameService = gameService;
    this._exchangeAddress = _exchangeAddress;
  }

  async resetRelatedTables() {
    logger.info("==== reset tables start ====");
    await this._connection
      .createQueryBuilder()
      .delete()
      .from(AssetHistoryEntity)
      .execute();
    logger.info("====AssetHistoryEntity Removed====");
    await this._connection
      .createQueryBuilder()
      .delete()
      .from(AssetEntity)
      .execute();
    logger.info("====AssetEntity Removed====");
    await this._connection
      .createQueryBuilder()
      .delete()
      .from(CollectionHistoryEntity)
      .execute();
    logger.info("====CollectionHistoryEntity Removed====");
    await this._connection
      .createQueryBuilder()
      .delete()
      .from(CollectionEntity)
      .execute();
    logger.info("====CollectionEntity Removed====");
    await this._connection
      .getRepository(AccountEntity)
      .createQueryBuilder()
      .update()
      .set({ assetCount: "0" })
      .execute();
    logger.info("====AccountEntity assetCount Reset Done====");
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
        const gameIds = (Array.isArray(info.gameIds)
          ? info.gameIds
          : []
        ).filter((id: string) => isValidUUID(id));
        const games = await this.gameService.getMultipleGames(gameIds);

        const collection: ICollection = {
          id: String(parsed.args[0]).toLowerCase(),
          block: log.blockNumber,
          address: String(parsed.args[0]).toLowerCase(),
          name: parsed.args[1],
          symbol: parsed.args[2],
          imageUrl: info.imageUrl || "",
          description: info.description || "",
          isPrivate: parsed.args[4],
          owner: String(log.address).toLowerCase(),
          totalSupply: ZERO_NUMBER,
          totalMinted: ZERO_NUMBER,
          totalBurned: ZERO_NUMBER,
          createTimeStamp: block.timestamp,
          updateTimeStamp: block.timestamp,
          games: games,
          gameIds,
          isVerified: false,
          isPremium: false,
          isFeatured: false,
        };

        logger.info(`===collection=created=${collection.address}==`);

        await this._createCollections([collection]);

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

  async listenERC721Contracts() {
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

        const gameIds = (Array.isArray(info.gameIds)
          ? info.gameIds
          : []
        ).filter((id: string) => isValidUUID(id));
        const games = await this.gameService.getMultipleGames(gameIds);

        const collection: ICollection = {
          id: String(tokenAddress).toLowerCase(),
          block: log.blockNumber,
          address: String(tokenAddress).toLowerCase(),
          name,
          symbol,
          imageUrl: info.imageUrl || "",
          description: info.description || "",
          isPrivate,
          owner: String(log.address).toLowerCase(),
          totalSupply: ZERO_NUMBER,
          totalMinted: ZERO_NUMBER,
          totalBurned: ZERO_NUMBER,
          createTimeStamp: block.timestamp,
          updateTimeStamp: block.timestamp,
          isVerified: false,
          isFeatured: false,
          isPremium: false,
          games: games,
          gameIds,
        };

        await this._createCollections([collection]);

        const erc721Service = new ERC721Service(
          collection.address,
          collection.block,
          this._connection,
          this._collectionService,
          this._collectionHistoryService,
          this._accountService,
          this._assetService,
          this._assetHistoryService,
          this.gameService,
          this._exchangeAddress
        );
        await erc721Service.listenAssets();
      }
    );
  }

  private async _createCollections(collections: ICollection[]) {
    const records = await this._connection
      .getRepository(CollectionEntity)
      .save(collections.map(collectionUtils.serialize));
    return (records as Required<CollectionEntity>[]).map(
      collectionUtils.deserialize
    );
  }
}
