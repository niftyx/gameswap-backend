import { BigNumber, Contract, ethers } from "ethers";
import { id, Interface } from "ethers/lib/utils";
import { Connection } from "typeorm";

import { logger } from "../app";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import { IAsset, IAssetHistory, ICollectionHistory } from "../types";
import { ZERO_ADDRESS } from "../utils/token";
import { CollectionService } from "./collection_service";
import { AccountService } from "./account_service";
import { ONE_NUMBER } from "../utils/number";
import { CollectionHistoryService } from "./collection_history_service";
import { AssetService } from "./asset_service";
import { AssetHistoryService } from "./asset_history_service";

const abi = [
  "event SetTokenData(uint256,string,string,string,string)",
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "event MetaDataChanged(string,string,string)",
  "event OwnershipTransferred(address indexed,address indexed)",
];

export class ERC721Service {
  private readonly _address: string;
  private readonly _blockNumber: number;
  //private readonly _connection: Connection;
  private readonly _collectionService: CollectionService;
  private readonly _accountService: AccountService;
  private readonly _collectionHistoryService: CollectionHistoryService;
  private readonly _assetService: AssetService;
  private readonly _assetHistoryService: AssetHistoryService;

  constructor(
    _address: string,
    _blockNumber: number,
    _connection: Connection,
    _collectionService: CollectionService,
    _collectionHistoryService: CollectionHistoryService,
    _accountService: AccountService,
    _assetService: AssetService,
    _assetHistoryService: AssetHistoryService
  ) {
    //this._connection = _connection;
    this._address = _address;
    this._blockNumber = _blockNumber;
    this._collectionService = _collectionService;
    this._collectionHistoryService = _collectionHistoryService;
    this._accountService = _accountService;
    this._assetService = _assetService;
    this._assetHistoryService = _assetHistoryService;
  }

  async syncAssets() {
    const provider = new ethers.providers.JsonRpcProvider(
      defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl,
      CHAIN_ID
    );
    const iface = new Interface(abi);
    const ens = new Contract(this._address, iface, provider);

    logger.info(`=== syncing asset start ${this._address}=====`);

    logger.info("=== get Ownership transfer  ===");

    let collection = await this._collectionService.getCollection(this._address);
    let filter: any = ens.filters.OwnershipTransferred();
    filter.fromBlock = this._blockNumber;
    filter.toBlock = "latest";
    let logs = await provider.getLogs(filter);

    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];
      const blockNumber = log.blockNumber;
      const block = await provider.getBlock(blockNumber);
      const parsed = iface.parseLog(log);

      const collectionTxHash = String(log.transactionHash).toLowerCase();
      const ownerAddress = String(parsed.args[1]).toLowerCase();

      collection.owner = ownerAddress;
      collection.updateTimeStamp = block.timestamp;
      collection = await this._collectionService.updateCollection(collection);

      const collectionHistory: ICollectionHistory = {
        id: `${collectionTxHash}${ownerAddress}`,
        timestamp: block.timestamp,
        txHash: collectionTxHash,
        owner: ownerAddress,
        collection,
      };

      await this._collectionHistoryService.addHistory(collectionHistory);
    }

    logger.info("=== get transfer & setTokenData events  ===");
    filter = ens.filters.Transfer();
    filter.fromBlock = this._blockNumber;
    filter.toBlock = "latest";

    logs = await provider.getLogs(filter);

    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];

      const blockNumber = log.blockNumber;
      const block = await provider.getBlock(blockNumber);
      const parsed = iface.parseLog(log);

      if (parsed.args[0] === ZERO_ADDRESS) {
        // minting asset
        const transaction = await provider.getTransactionReceipt(
          log.transactionHash
        );

        const assetDataLog = transaction.logs.find((lg) =>
          lg.topics.includes(
            id("SetTokenData(uint256,string,string,string,string)")
          )
        );

        // increase totalSupply and totalMinted of collection
        collection.totalSupply = collection.totalSupply.add(ONE_NUMBER);
        collection.totalMinted = collection.totalMinted.add(ONE_NUMBER);
        collection = await this._collectionService.updateCollection(collection);

        // handle account
        const ownerAddress = String(parsed.args[1]).toLowerCase();
        let account = await this._accountService.getOrCreateAccount(
          ownerAddress,
          block.timestamp
        );

        // increase assetCount and update
        account.assetCount = account.assetCount.add(ONE_NUMBER);
        account = await this._accountService.updateAccount(account);

        let asset: IAsset = {
          id: (parsed.args[2] as BigNumber).toHexString(),
          assetId: parsed.args[2],
          assetURL: "",
          gameId: "",
          categoryId: "",
          contentId: "",
          currentOwner: account,
          createTimeStamp: block.timestamp,
          updateTimeStamp: block.timestamp,
          history: [],
          orders: [],
          collection,
        };

        if (assetDataLog) {
          const parsedDataLog = iface.parseLog(assetDataLog);
          asset.assetURL = parsedDataLog.args[1];
          asset.gameId = parsedDataLog.args[2];
          asset.categoryId = parsedDataLog.args[3];
          asset.contentId = parsedDataLog.args[4];
        }

        asset = await this._assetService.addAsset(asset);

        const assetTxHash = String(log.transactionHash).toLowerCase();

        const assetHistory: IAssetHistory = {
          id: assetTxHash,
          owner: account.address,
          txHash: assetTxHash,
          timestamp: block.timestamp,
          asset,
        };

        await this._assetHistoryService.addHistory(assetHistory);
      } else if (parsed.args[1] === ZERO_ADDRESS) {
        // burn assets
      } else {
        // transfer asset
      }
    }

    logger.info(`=== syncing asset end ${this._address}=====`);
  }
}
