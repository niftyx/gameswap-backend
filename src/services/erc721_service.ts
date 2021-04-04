import { assetDataUtils } from "@0x/order-utils";
import { GameService } from "./game_service";
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

const exchangeAbi = [
  "event Fill(address indexed,address indexed,bytes,bytes,bytes,bytes,bytes32 indexed,address,address,uint256,uint256,uint256,uint256,uint256)",
];

const abi = [
  "event SetTokenData(uint256,string,string,string,string)",
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "event MetaDataChanged(string,string,bool)",
  "event OwnershipTransferred(address indexed,address indexed)",
];

const SET_TOKEN_DATA_ID = id(
  "SetTokenData(uint256,string,string,string,string)"
);

export class ERC721Service {
  private readonly _address: string;
  private readonly _blockNumber: number;
  private readonly _exchangeAddress: string;
  //private readonly _connection: Connection;
  private readonly _collectionService: CollectionService;
  private readonly _accountService: AccountService;
  private readonly _collectionHistoryService: CollectionHistoryService;
  private readonly _assetService: AssetService;
  private readonly _assetHistoryService: AssetHistoryService;
  private readonly _gameService: GameService;

  constructor(
    _address: string,
    _blockNumber: number,
    _connection: Connection,
    _collectionService: CollectionService,
    _collectionHistoryService: CollectionHistoryService,
    _accountService: AccountService,
    _assetService: AssetService,
    _assetHistoryService: AssetHistoryService,
    _gameService: GameService,
    _exchangeAddress: string
  ) {
    //this._connection = _connection;
    this._address = _address;
    this._blockNumber = _blockNumber;
    this._collectionService = _collectionService;
    this._collectionHistoryService = _collectionHistoryService;
    this._accountService = _accountService;
    this._assetService = _assetService;
    this._assetHistoryService = _assetHistoryService;
    this._gameService = _gameService;
    this._exchangeAddress = _exchangeAddress;
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

    let collection = await this._collectionService.get(this._address);

    if (!collection) return;

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
      const newOwner = String(parsed.args[1]).toLowerCase();

      collection.owner = newOwner;
      collection.updateTimeStamp = block.timestamp;
      collection = await this._collectionService.update(collection);

      const collectionHistory: ICollectionHistory = {
        id: `${collectionTxHash}${newOwner}`,
        timestamp: block.timestamp,
        txHash: collectionTxHash,
        owner: newOwner,
        collection,
      };

      await this._collectionHistoryService.add(collectionHistory);
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

      logger.info(
        `=====transfer=${this._address}==${parsed.args[0]} => ${parsed.args[1]}  ${parsed.args[2]}===`
      );

      if (parsed.args[0] === ZERO_ADDRESS) {
        // minting asset
        logger.info("=====mint======");
        const transaction = await provider.getTransactionReceipt(
          log.transactionHash
        );

        const assetDataLog = transaction.logs.find((lg) =>
          lg.topics.includes(SET_TOKEN_DATA_ID)
        );

        // increase totalSupply and totalMinted of collection
        collection.totalSupply = collection.totalSupply.add(ONE_NUMBER);
        collection.totalMinted = collection.totalMinted.add(ONE_NUMBER);
        collection = await this._collectionService.update(collection);

        // handle account
        const ownerAddress = String(parsed.args[1]).toLowerCase();
        let account = await this._accountService.getOrCreateAccount(
          ownerAddress,
          block.timestamp
        );

        // increase assetCount and update
        account.assetCount = account.assetCount.add(ONE_NUMBER);
        account = await this._accountService.update(account);

        let asset: IAsset = {
          id: log.transactionHash.toLowerCase(),
          assetId: parsed.args[2],
          assetURL: "",
          gameId: "",
          categoryId: "",
          contentId: "",
          currentOwner: account,
          creator: account,
          createTimeStamp: block.timestamp,
          updateTimeStamp: block.timestamp,
          history: [],
          collection,
        };

        if (assetDataLog) {
          const parsedDataLog = iface.parseLog(assetDataLog);
          asset.assetURL = parsedDataLog.args[1];
          asset.gameId = parsedDataLog.args[2];
          asset.categoryId = parsedDataLog.args[3];
          asset.contentId = parsedDataLog.args[4];
          const game = await this._gameService.get(asset.gameId);
          if (game) {
            asset.game = game;
          }
        }
        asset = await this._assetService.add(asset);

        const assetTxHash = String(log.transactionHash).toLowerCase();

        const assetHistory: IAssetHistory = {
          id: assetTxHash,
          owner: account.address,
          txHash: assetTxHash,
          timestamp: block.timestamp,
          asset,
        };

        await this._assetHistoryService.add(assetHistory);
      } else if (parsed.args[1] === ZERO_ADDRESS) {
        // burn assets
        logger.info("=====burn======");
        const previousOwner = String(parsed.args[0]).toLowerCase();
        const assetId = parsed.args[2] as BigNumber;
        let asset = await this._assetService.getByTokenIdAndCollectionId(
          assetId,
          collection.id
        );
        let previousAccount = await this._accountService.get(previousOwner);
        if (!previousAccount) {
          return;
        }
        let account = await this._accountService.getOrCreateAccount(
          ZERO_ADDRESS,
          block.timestamp
        );

        if (asset) {
          // change owner of asset
          asset.currentOwner = account;
          asset = await this._assetService.update(asset);

          // write asset history
          const assetTxHash = String(log.transactionHash).toLowerCase();
          const assetHistory: IAssetHistory = {
            id: assetTxHash,
            owner: ZERO_ADDRESS,
            txHash: assetTxHash,
            timestamp: block.timestamp,
            asset,
          };
          await this._assetHistoryService.add(assetHistory);

          // previousOwner.assetCount - 1
          previousAccount.assetCount = previousAccount.assetCount.sub(
            ONE_NUMBER
          );
          await this._accountService.update(previousAccount);

          account.assetCount = account.assetCount.add(ONE_NUMBER);
          await this._accountService.update(account);

          // update totalBurn and totalSupply of collection
          collection.totalSupply = collection.totalSupply.sub(ONE_NUMBER);
          collection.totalBurned = collection.totalBurned.add(ONE_NUMBER);
          collection = await this._collectionService.update(collection);
        }
      } else {
        // transfer asset
        logger.info("=====transfer======");
        const previousOwner = String(parsed.args[0]).toLowerCase();
        const newOwner = String(parsed.args[1]).toLowerCase();
        const assetId = parsed.args[2] as BigNumber;
        let asset = await this._assetService.getByTokenIdAndCollectionId(
          assetId,
          collection.id
        );

        let previousAccount = await this._accountService.get(previousOwner);
        if (!previousAccount) return;
        let newAccount = await this._accountService.getOrCreateAccount(
          newOwner,
          block.timestamp
        );

        if (asset) {
          //
          previousAccount.assetCount = previousAccount.assetCount.sub(
            ONE_NUMBER
          );
          await this._accountService.update(previousAccount);

          newAccount.assetCount = newAccount.assetCount.add(ONE_NUMBER);
          newAccount = await this._accountService.update(newAccount);

          // update asset
          asset.currentOwner = newAccount;
          asset = await this._assetService.update(asset);

          const assetTxHash = String(log.transactionHash).toLowerCase();
          const assetHistory: IAssetHistory = {
            id: assetTxHash,
            owner: newAccount.address,
            txHash: assetTxHash,
            timestamp: block.timestamp,
            asset,
          };

          await this._assetHistoryService.add(assetHistory);
        }
      }
    }

    logger.info("=== get MetaDataChanged events  ===");
    filter = ens.filters.MetaDataChanged();
    filter.fromBlock = this._blockNumber;
    filter.toBlock = "latest";

    logs = await provider.getLogs(filter);

    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];
      const parsed = iface.parseLog(log);

      collection.imageUrl = parsed.args[0];
      collection.description = parsed.args[1];
      collection.isPrivate = parsed.args[2];
      collection = await this._collectionService.update(collection);
    }

    logger.info(`=== syncing asset end ${this._address}=====`);
  }

  async listenAssets() {
    const provider = new ethers.providers.JsonRpcProvider(
      defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl,
      CHAIN_ID
    );
    const iface = new Interface(abi);
    const ens = new Contract(this._address, iface, provider);

    const exchangeInterface = new Interface(exchangeAbi);
    const exchangeContract = new Contract(
      this._exchangeAddress,
      exchangeInterface,
      provider
    );

    const exchangeFilter: any = exchangeContract.filters.Fill();
    const EXCHANGE_ORDER_FILLED_ID = exchangeFilter.topics[0];

    logger.info(`=== listen asset ${this._address}=====`);

    // collection ownership listen
    ens.on(
      "OwnershipTransferred",
      async (from: string, to: string, log: ethers.providers.Log) => {
        logger.info(
          `=== collection ownership transferred ${this._address} ${from}=>${to} ===`
        );
        let collection = await this._collectionService.get(this._address);

        if (!collection) return;

        const blockNumber = log.blockNumber;
        const block = await provider.getBlock(blockNumber);

        const collectionTxHash = String(log.transactionHash).toLowerCase();
        const newOwner = to.toLowerCase();

        if (collection.owner === newOwner) {
          logger.info("===Already handled===");
          return;
        }

        collection.owner = newOwner;
        collection = await this._collectionService.update(collection);

        const collectionHistory: ICollectionHistory = {
          id: `${collectionTxHash}${newOwner}`,
          timestamp: block.timestamp,
          txHash: collectionTxHash,
          owner: newOwner,
          collection,
        };

        await this._collectionHistoryService.add(collectionHistory);
      }
    );

    ens.on(
      "MetaDataChanged",
      async (
        imageUrl: string,
        description: string,
        isPrivate: boolean,
        _log: ethers.providers.Log
      ) => {
        logger.info(
          `=== collection MetaDataChanged ${this._address} ${imageUrl}=>${isPrivate} ===`
        );
        let collection = await this._collectionService.get(this._address);

        if (!collection) return;

        collection.imageUrl = imageUrl;
        collection.description = description;
        collection.isPrivate = isPrivate;
        collection = await this._collectionService.update(collection);
      }
    );

    ens.on(
      "Transfer",
      async (
        from: string,
        to: string,
        tokenId: BigNumber,
        log: ethers.providers.Log
      ) => {
        logger.info(
          `=== asset transfer ${
            this._address
          } ${from}=>${to} ${tokenId.toHexString()}===`
        );
        const blockNumber = log.blockNumber;
        const block = await provider.getBlock(blockNumber);
        const assetTxHash = String(log.transactionHash).toLowerCase();
        let collection = await this._collectionService.get(this._address);

        if (!collection) return;

        if (from === ZERO_ADDRESS) {
          // mint
          logger.info("=====mint======");

          // check if already minted
          let prevAsset = await this._assetService.get(assetTxHash);
          if (prevAsset) {
            logger.info("===Already handled===");
            return;
          }

          const transaction = await provider.getTransactionReceipt(
            log.transactionHash
          );

          const assetDataLog = transaction.logs.find((lg) =>
            lg.topics.includes(SET_TOKEN_DATA_ID)
          );

          // increase totalSupply and totalMinted of collection
          collection.totalSupply = collection.totalSupply.add(ONE_NUMBER);
          collection.totalMinted = collection.totalMinted.add(ONE_NUMBER);
          collection = await this._collectionService.update(collection);

          // handle account
          const ownerAddress = to.toLowerCase();
          let account = await this._accountService.getOrCreateAccount(
            ownerAddress,
            block.timestamp
          );

          // increase assetCount and update
          account.assetCount = account.assetCount.add(ONE_NUMBER);
          account = await this._accountService.update(account);

          let asset: IAsset = {
            id: log.transactionHash.toLowerCase(),
            assetId: tokenId,
            assetURL: "",
            gameId: "",
            categoryId: "",
            contentId: "",
            currentOwner: account,
            creator: account,
            createTimeStamp: block.timestamp,
            updateTimeStamp: block.timestamp,
            history: [],
            collection,
          };

          if (assetDataLog) {
            const parsedDataLog = iface.parseLog(assetDataLog);
            asset.assetURL = parsedDataLog.args[1];
            asset.gameId = parsedDataLog.args[2];
            asset.categoryId = parsedDataLog.args[3];
            asset.contentId = parsedDataLog.args[4];
            const game = await this._gameService.get(asset.gameId);
            if (game) {
              asset.game = game;
            }
          }

          asset = await this._assetService.add(asset);

          const assetHistory: IAssetHistory = {
            id: assetTxHash,
            owner: account.address,
            txHash: assetTxHash,
            timestamp: block.timestamp,
            asset,
          };

          await this._assetHistoryService.add(assetHistory);
        } else if (to === ZERO_ADDRESS) {
          // burn

          const previousOwner = from.toLowerCase();
          let asset = await this._assetService.getByTokenIdAndCollectionId(
            tokenId,
            collection.id
          );
          let previousAccount = await this._accountService.get(previousOwner);
          if (!previousAccount) return;
          let account = await this._accountService.getOrCreateAccount(
            ZERO_ADDRESS,
            block.timestamp
          );
          logger.info("=====burn======");
          if (asset) {
            // check if already burnt
            if (asset.currentOwner && asset.currentOwner.id === account.id) {
              logger.info("===Already handled===");
              return;
            }

            // previousOwner.assetCount - 1
            previousAccount.assetCount = previousAccount.assetCount.sub(
              ONE_NUMBER
            );
            await this._accountService.update(previousAccount);

            account.assetCount = account.assetCount.add(ONE_NUMBER);
            account = await this._accountService.update(account);

            // change owner of asset
            asset.currentOwner = account;
            asset = await this._assetService.update(asset);

            // write asset history
            const assetTxHash = String(log.transactionHash).toLowerCase();
            const assetHistory: IAssetHistory = {
              id: assetTxHash,
              owner: ZERO_ADDRESS,
              txHash: assetTxHash,
              timestamp: block.timestamp,
              asset,
            };
            await this._assetHistoryService.add(assetHistory);

            // update totalBurn and totalSupply of collection
            collection.totalSupply = collection.totalSupply.sub(ONE_NUMBER);
            collection.totalBurned = collection.totalBurned.add(ONE_NUMBER);
            collection = await this._collectionService.update(collection);
          }
        } else {
          // transfer asset

          const transaction = await provider.getTransactionReceipt(
            log.transactionHash
          );

          const orderFillLog = transaction.logs.find((lg) =>
            lg.topics.includes(EXCHANGE_ORDER_FILLED_ID)
          );

          const previousOwner = from.toLowerCase();
          const newOwner = to.toLowerCase();
          let asset = await this._assetService.getByTokenIdAndCollectionId(
            tokenId,
            collection.id
          );
          let previousAccount = await this._accountService.get(previousOwner);
          if (!previousAccount) return;
          let newAccount = await this._accountService.getOrCreateAccount(
            newOwner,
            block.timestamp
          );

          logger.info("=====transfer======");

          if (asset) {
            //
            if (asset.currentOwner && asset.currentOwner.id === newAccount.id) {
              logger.info("===Already handled===");
              return;
            }

            //
            previousAccount.assetCount = previousAccount.assetCount.sub(
              ONE_NUMBER
            );
            await this._accountService.update(previousAccount);

            newAccount.assetCount = newAccount.assetCount.add(ONE_NUMBER);
            newAccount = await this._accountService.update(newAccount);

            // update asset
            asset.currentOwner = newAccount;
            await this._assetService.update(asset);

            const assetTxHash = String(log.transactionHash).toLowerCase();
            const assetHistory: IAssetHistory = {
              id: assetTxHash,
              owner: newAccount.address,
              txHash: assetTxHash,
              timestamp: block.timestamp,
              asset,
            };

            if (orderFillLog) {
              const exchangeInterface = new Interface(exchangeAbi);
              const parsed = exchangeInterface.parseLog(orderFillLog);
              const orderFillInfo = {
                makerAddress: String(parsed.args[0]).toLowerCase(),
                feeRecipientAddress: String(parsed.args[1]).toLowerCase(),
                makerAssetData: parsed.args[2],
                takerAssetData: parsed.args[3],
                makerFeeAssetData: parsed.args[4],
                takerFeeAssetData: parsed.args[5],
                orderHash: String(parsed.args[6]),
                takerAddress: String(parsed.args[7]).toLowerCase(),
                senderAddress: String(parsed.args[8]).toLowerCase(),
                makerAssetFilledAmount: parsed.args[9] as BigNumber,
                takerAssetFilledAmount: parsed.args[10] as BigNumber,
                makerFeePaid: parsed.args[11] as BigNumber,
                takerFeePaid: parsed.args[12] as BigNumber,
                protocolFeePaid: parsed.args[13] as BigNumber,
              };
              const takerAsset = assetDataUtils.decodeAssetDataOrThrow(
                orderFillInfo.takerAssetData
              ) as any;
              assetHistory.erc20 = String(
                takerAsset.tokenAddress
              ).toLowerCase();
              assetHistory.erc20Amount = orderFillInfo.takerAssetFilledAmount;
              logger.info(
                `====Order Filled => txHash${assetHistory.erc20} ${assetHistory.erc20Amount}===`
              );
            }
            await this._assetHistoryService.add(assetHistory);
          }
        }
      }
    );
  }
}
