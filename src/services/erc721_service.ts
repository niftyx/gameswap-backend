import { BigNumber, Contract, ethers } from "ethers";
import { id, Interface } from "ethers/lib/utils";
import { Connection } from "typeorm";

import { logger } from "../app";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import { IAsset } from "../types";
// import { IAsset } from "../types";
import { ZERO_ADDRESS } from "../utils/token";
import { CollectionService } from "./collection_service";
import { AccountService } from "./account_service";

const abi = [
  "event SetTokenData(uint256,string,string,string,string)",
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "event MetaDataChanged(string,string,string)",
  "event OwnershipTransferred(indexed address,indexed address)",
];

export class ERC721Service {
  private readonly _address: string;
  private readonly _blockNumber: number;
  //private readonly _connection: Connection;
  private readonly _collectionService: CollectionService;
  private readonly _accountService: AccountService;

  constructor(
    _address: string,
    _blockNumber: number,
    _connection: Connection,
    _collectionService: CollectionService,
    _accountService: AccountService
  ) {
    //this._connection = _connection;
    this._address = _address;
    this._blockNumber = _blockNumber;
    this._collectionService = _collectionService;
    this._accountService = _accountService;
  }

  async syncAssets() {
    const provider = new ethers.providers.JsonRpcProvider(
      defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl,
      CHAIN_ID
    );
    const iface = new Interface(abi);
    const ens = new Contract(this._address, iface, provider);

    logger.info(`=== syncing asset start ${this._address}=====`);

    logger.info("=== get create & setTokenData events  ===");
    let filter: any = ens.filters.Transfer(ZERO_ADDRESS);
    filter.fromBlock = this._blockNumber;
    filter.toBlock = "latest";

    let logs = await provider.getLogs(filter);

    const collection = await this._collectionService.getCollection(
      this._address
    );

    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];

      const blockNumber = log.blockNumber;

      const block = await provider.getBlock(blockNumber);
      const parsed = iface.parseLog(log);

      const transaction = await provider.getTransactionReceipt(
        log.transactionHash
      );
      const assetDataLog = transaction.logs.find((lg) =>
        lg.topics.includes(
          id("SetTokenData(uint256,string,string,string,string)")
        )
      );

      const ownerAddress = String(parsed.args[1]).toLowerCase();
      const account = await this._accountService.getOrCreateAccount(
        ownerAddress,
        block.timestamp
      );
      const asset: IAsset = {
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

      logger.info(asset);
    }

    logger.info(`=== syncing asset end ${this._address}=====`);
  }
}
