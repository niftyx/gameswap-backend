import { Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import * as _ from "lodash";
import { Connection } from "typeorm";
import { logger } from "../app";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import {
  AccountEntity,
  AssetEntity,
  AssetHistoryEntity,
  CollectionEntity,
  CollectionHistoryEntity,
  ZeroXOrderEntity,
} from "../entities";
import { ICollection } from "../types";
import { collectionUtils } from "../utils/collection_utils";
import { ZERO_NUMBER } from "../utils/number";

const abi = [
  "event CollectionCreated(address indexed tokenAddress,string name,string symbol,string imageURL,string description,string shortUrl)",
];

export class FactoryService {
  private readonly _factoryAddress: string;
  private readonly _factoryBlockNumber: number;
  private readonly _connection: Connection;

  constructor(
    _connection: Connection,
    factoryAddress: string,
    _factoryBlockNumber: number
  ) {
    this._connection = _connection;
    this._factoryAddress = factoryAddress;
    this._factoryBlockNumber = _factoryBlockNumber;
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
      .createQueryBuilder()
      .delete()
      .from(AccountEntity)
      .execute();
    logger.info("====AccountEntity Removed====");
    await this._connection
      .createQueryBuilder()
      .delete()
      .from(ZeroXOrderEntity)
      .execute();
    logger.info("====ZeroXOrderEntity Removed====");
    logger.info("==== reset tables end ====");
  }

  async syncERC721Contracts(): Promise<{ address: string; block: number }[]> {
    const provider = new ethers.providers.JsonRpcProvider(
      defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl,
      CHAIN_ID
    );
    const iface = new Interface(abi);
    const ens = new Contract(this._factoryAddress, iface, provider);
    let filter: any = ens.filters.CollectionCreated();
    filter.fromBlock = this._factoryBlockNumber;
    filter.toBlock = "latest";

    logger.info("==== ERC721 Factory Sync Start ===");

    const logs = await provider.getLogs(filter);

    const erc721Contracts: { address: string; block: number }[] = [];

    const promises = logs.map(async (log) => {
      const blockNumber = log.blockNumber;
      const block = await provider.getBlock(blockNumber);
      const parsed = iface.parseLog(log);

      const collection: ICollection = {
        id: String(parsed.args[0]).toLowerCase(),
        block: log.blockNumber,
        address: String(parsed.args[0]).toLowerCase(),
        name: parsed.args[1],
        symbol: parsed.args[2],
        imageUrl: parsed.args[3],
        description: parsed.args[4],
        shortUrl: parsed.args[5],
        owner: log.address,
        totalSupply: ZERO_NUMBER,
        totalMinted: ZERO_NUMBER,
        totalBurned: ZERO_NUMBER,
        createTimeStamp: block.timestamp,
        updateTimeStamp: block.timestamp,
        assets: [],
        history: [],
      };

      await this._createOrGetCollection([collection]);

      erc721Contracts.push({
        address: collection.address,
        block: collection.block,
      });
    });

    await Promise.all(promises);

    logger.info("==== ERC721 Factory Sync End ===");

    return erc721Contracts;
  }

  async listenERC721Contracts() {}

  private async _createOrGetCollection(collections: ICollection[]) {
    const records = await this._connection
      .getRepository(CollectionEntity)
      .save(collections.map(collectionUtils.serializeCollection));
    return (records as Required<CollectionEntity>[]).map(
      collectionUtils.deserializeCollection
    );
  }
}
