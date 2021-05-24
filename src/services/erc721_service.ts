import { assetDataUtils } from "@0x/order-utils";
import { GameService } from "./game_service";
import { BigNumber, Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { Connection } from "typeorm";
import * as isValidUUID from "uuid-validate";

import { logger } from "../app";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import { IAsset, IAssetHistory, ICollectionHistory } from "../types";
import { ZERO_ADDRESS } from "../utils/token";
import { CollectionService } from "./collection_service";
import { UserService } from "./user_service";
import { ONE_NUMBER } from "../utils/number";
import { CollectionHistoryService } from "./collection_history_service";
import { AssetService } from "./asset_service";
import { AssetHistoryService } from "./asset_history_service";
import {
  ERC20_ASSET_PROXY_ID,
  ERC721_ASSET_PROXY_ID,
  LOG_PAGE_COUNT,
} from "../constants";
import axios from "axios";

const exchangeAbi = [
  "event Fill(address indexed,address indexed,bytes,bytes,bytes,bytes,bytes32 indexed,address,address,uint256,uint256,uint256,uint256,uint256)",
];

const abi = [
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "event MetaDataChanged(string,string,bool)",
  "event OwnershipTransferred(address indexed,address indexed)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
];

export class ERC721Service {
  private readonly _address: string;
  private readonly _blockNumber: number;
  private readonly exchangeAddress: string;
  //private readonly connection: Connection;
  private readonly collectionService: CollectionService;
  private readonly userService: UserService;
  private readonly collectionHistoryService: CollectionHistoryService;
  private readonly assetService: AssetService;
  private readonly assetHistoryService: AssetHistoryService;
  private readonly gameService: GameService;

  constructor(
    _address: string,
    _blockNumber: number,
    _connection: Connection,
    collectionService: CollectionService,
    collectionHistoryService: CollectionHistoryService,
    userService: UserService,
    assetService: AssetService,
    assetHistoryService: AssetHistoryService,
    gameService: GameService,
    exchangeAddress: string
  ) {
    //this.connection = connection;
    this._address = _address;
    this._blockNumber = _blockNumber;
    this.collectionService = collectionService;
    this.collectionHistoryService = collectionHistoryService;
    this.userService = userService;
    this.assetService = assetService;
    this.assetHistoryService = assetHistoryService;
    this.gameService = gameService;
    this.exchangeAddress = exchangeAddress;
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

    let collection = await this.collectionService.get(this._address);

    if (!collection) return;

    const latestBlockNumber = await provider.getBlockNumber();
    let currentScannedBlockNumber = this._blockNumber - 1;

    while (currentScannedBlockNumber < latestBlockNumber) {
      let filter: any = ens.filters.OwnershipTransferred();
      filter.fromBlock = currentScannedBlockNumber + 1;
      filter.toBlock = currentScannedBlockNumber + LOG_PAGE_COUNT + 1;
      filter.toBlock = Math.min(filter.toBlock, latestBlockNumber);

      let logs = await provider.getLogs(filter);

      for (let index = 0; index < logs.length; index++) {
        const log = logs[index];
        const blockNumber = log.blockNumber;
        const block = await provider.getBlock(blockNumber);
        const parsed = iface.parseLog(log);

        const collectionTxHash = String(log.transactionHash).toLowerCase();
        const newOwner = await this.userService.getOrCreate(
          String(parsed.args[1]).toLowerCase(),
          block.timestamp
        );

        collection.owner = newOwner;
        collection.updateTimestamp = block.timestamp;
        collection = await this.collectionService.update(collection);

        const collectionHistory: ICollectionHistory = {
          id: `${collectionTxHash}${newOwner}`,
          timestamp: block.timestamp,
          txHash: collectionTxHash,
          owner: newOwner,
          collection,
        };

        await this.collectionHistoryService.add(collectionHistory);
      }

      logger.info("=== get transfer events  ===");
      filter = ens.filters.Transfer();
      filter.fromBlock = currentScannedBlockNumber + 1;
      filter.toBlock = currentScannedBlockNumber + LOG_PAGE_COUNT + 1;
      filter.toBlock = Math.min(filter.toBlock, latestBlockNumber);

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

          const tokenURI = await ens.tokenURI(parsed.args[2]);
          let tokenInfo: any;

          try {
            tokenInfo = (await axios.get(tokenURI)).data || {};
          } catch (error) {
            tokenInfo = {};
          }

          // increase totalSupply and totalMinted of collection
          collection.totalSupply = collection.totalSupply.add(ONE_NUMBER);
          collection.totalMinted = collection.totalMinted.add(ONE_NUMBER);
          collection = await this.collectionService.update(collection);

          // handle user
          const ownerAddress = String(parsed.args[1]).toLowerCase();
          let user = await this.userService.getOrCreate(
            ownerAddress,
            block.timestamp
          );

          // increase assetCount and update
          user = await this.userService.update(user);

          let asset: IAsset = {
            id: log.transactionHash.toLowerCase(),
            assetId: parsed.args[2],
            assetURL: "",
            gameId: "",
            contentId: "",
            currentOwner: user,
            creator: user,
            createTimestamp: block.timestamp,
            updateTimestamp: block.timestamp,
            history: [],
            collection,
            collectionId: collection.id,
          };

          if (tokenInfo) {
            asset.assetURL = tokenURI;
            asset.gameId = tokenInfo.gameId;
            asset.contentId = tokenInfo.contentId;
            const game = await this.gameService.get(asset.gameId);
            if (game) {
              asset.game = game;
            }
          }
          asset = await this.assetService.add(asset);

          const assetTxHash = String(log.transactionHash).toLowerCase();

          const assetHistory: IAssetHistory = {
            id: assetTxHash,
            owner: user,
            txHash: assetTxHash,
            timestamp: block.timestamp,
            asset,
          };

          await this.assetHistoryService.add(assetHistory);
        } else if (parsed.args[1] === ZERO_ADDRESS) {
          // burn assets
          logger.info("=====burn======");
          const previousOwner = String(parsed.args[0]).toLowerCase();
          const assetId = parsed.args[2] as BigNumber;
          let asset = await this.assetService.getByTokenIdAndCollectionId(
            assetId,
            collection.id
          );
          let previousUser = await this.userService.get(previousOwner);
          if (!previousUser) {
            return;
          }
          let user = await this.userService.getOrCreate(
            ZERO_ADDRESS,
            block.timestamp
          );

          if (asset) {
            // change owner of asset
            asset.currentOwner = user;
            asset = await this.assetService.update(asset);

            // write asset history
            const assetTxHash = String(log.transactionHash).toLowerCase();
            const assetHistory: IAssetHistory = {
              id: assetTxHash,
              txHash: assetTxHash,
              timestamp: block.timestamp,
              asset,
            };
            await this.assetHistoryService.add(assetHistory);

            // update totalBurn and totalSupply of collection
            collection.totalSupply = collection.totalSupply.sub(ONE_NUMBER);
            collection.totalBurned = collection.totalBurned.add(ONE_NUMBER);
            collection = await this.collectionService.update(collection);
          }
        } else {
          // transfer asset
          logger.info("=====transfer======");
          const previousOwner = String(parsed.args[0]).toLowerCase();
          const newOwner = String(parsed.args[1]).toLowerCase();
          const assetId = parsed.args[2] as BigNumber;
          let asset = await this.assetService.getByTokenIdAndCollectionId(
            assetId,
            collection.id
          );

          let previousUser = await this.userService.get(previousOwner);
          if (!previousUser) return;
          let newUser = await this.userService.getOrCreate(
            newOwner,
            block.timestamp
          );

          if (asset) {
            // update asset
            asset.currentOwner = newUser;
            asset = await this.assetService.update(asset);

            const assetTxHash = String(log.transactionHash).toLowerCase();
            const assetHistory: IAssetHistory = {
              id: assetTxHash,
              owner: newUser,
              txHash: assetTxHash,
              timestamp: block.timestamp,
              asset,
            };

            await this.assetHistoryService.add(assetHistory);
          }
        }
      }

      logger.info("=== get MetaDataChanged events  ===");
      filter = ens.filters.MetaDataChanged();
      filter.fromBlock = currentScannedBlockNumber + 1;
      filter.toBlock = currentScannedBlockNumber + LOG_PAGE_COUNT + 1;
      filter.toBlock = Math.min(filter.toBlock, latestBlockNumber);

      logs = await provider.getLogs(filter);

      for (let index = 0; index < logs.length; index++) {
        const log = logs[index];
        const parsed = iface.parseLog(log);

        const infoUrl = parsed.args[0];
        let info: any;
        try {
          info = (await axios.get(infoUrl)).data || {};
        } catch (error) {
          info = {};
        }

        const gameIds = (
          Array.isArray(info.gameIds) ? info.gameIds : []
        ).filter((id: string) => isValidUUID(id));
        const games = await this.gameService.getMultipleGames(gameIds);

        collection.imageUrl = info.imageUrl;
        collection.description = info.description;
        collection.games = games;

        collection.isPrivate = parsed.args[1];
        collection = await this.collectionService.update(collection);
      }

      currentScannedBlockNumber =
        currentScannedBlockNumber + 1 + LOG_PAGE_COUNT;
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
      this.exchangeAddress,
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
        let collection = await this.collectionService.get(this._address);

        if (!collection) return;

        const blockNumber = log.blockNumber;
        const block = await provider.getBlock(blockNumber);

        const collectionTxHash = String(log.transactionHash).toLowerCase();
        const newOwner = await this.userService.getOrCreate(
          to.toLowerCase(),
          block.timestamp
        );

        if (collection.owner?.id === newOwner.id) {
          logger.info("===Already handled===");
          return;
        }

        collection.owner = newOwner;
        collection = await this.collectionService.update(collection);

        const collectionHistory: ICollectionHistory = {
          id: `${collectionTxHash}${newOwner}`,
          timestamp: block.timestamp,
          txHash: collectionTxHash,
          owner: newOwner,
          collection,
        };

        await this.collectionHistoryService.add(collectionHistory);
      }
    );

    ens.on(
      "MetaDataChanged",
      async (
        infoUrl: string,
        isPrivate: boolean,
        _log: ethers.providers.Log
      ) => {
        logger.info(
          `=== collection MetaDataChanged ${this._address} ${infoUrl}=>${isPrivate} ===`
        );
        let collection = await this.collectionService.get(this._address);

        if (!collection) return;

        let info: any;
        try {
          info = (await axios.get(infoUrl)).data || {};
        } catch (error) {
          info = {};
        }

        const gameIds = (
          Array.isArray(info.gameIds) ? info.gameIds : []
        ).filter((id: string) => isValidUUID(id));
        const games = await this.gameService.getMultipleGames(gameIds);

        collection.imageUrl = info.imageUrl;
        collection.description = info.description;
        collection.games = games;

        collection.isPrivate = isPrivate;
        collection = await this.collectionService.update(collection);
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
        let collection = await this.collectionService.get(this._address);

        if (!collection) return;

        if (from === ZERO_ADDRESS) {
          // mint
          logger.info("=====mint======");

          // check if already minted
          let prevAsset = await this.assetService.get(assetTxHash);
          if (prevAsset) {
            logger.info("===Already handled===");
            return;
          }

          const tokenURI = await ens.tokenURI(tokenId);
          let tokenInfo: any;

          try {
            tokenInfo = (await axios.get(tokenURI)).data || {};
          } catch (error) {
            tokenInfo = {};
          }

          // increase totalSupply and totalMinted of collection
          collection.totalSupply = collection.totalSupply.add(ONE_NUMBER);
          collection.totalMinted = collection.totalMinted.add(ONE_NUMBER);
          collection = await this.collectionService.update(collection);

          // handle user
          const ownerAddress = to.toLowerCase();
          let user = await this.userService.getOrCreate(
            ownerAddress,
            block.timestamp
          );

          let asset: IAsset = {
            id: log.transactionHash.toLowerCase(),
            assetId: tokenId,
            assetURL: "",
            gameId: "",
            contentId: "",
            currentOwner: user,
            creator: user,
            createTimestamp: block.timestamp,
            updateTimestamp: block.timestamp,
            history: [],
            collection,
            collectionId: collection.id,
          };

          if (tokenInfo) {
            asset.assetURL = tokenURI;
            asset.gameId = tokenInfo.gameId;
            asset.contentId = tokenInfo.contentId;
            const game = await this.gameService.get(asset.gameId);
            if (game) {
              asset.game = game;
            }
          }

          asset = await this.assetService.add(asset);

          const assetHistory: IAssetHistory = {
            id: assetTxHash,
            owner: user,
            txHash: assetTxHash,
            timestamp: block.timestamp,
            asset,
          };

          await this.assetHistoryService.add(assetHistory);
        } else if (to === ZERO_ADDRESS) {
          // burn

          const previousOwner = from.toLowerCase();
          let asset = await this.assetService.getByTokenIdAndCollectionId(
            tokenId,
            collection.id
          );
          let previousUser = await this.userService.get(previousOwner);
          if (!previousUser) return;
          let user = await this.userService.getOrCreate(
            ZERO_ADDRESS,
            block.timestamp
          );
          logger.info("=====burn======");
          if (asset) {
            // check if already burnt
            if (asset.currentOwner && asset.currentOwner.id === user.id) {
              logger.info("===Already handled===");
              return;
            }

            // change owner of asset
            asset.currentOwner = user;
            asset = await this.assetService.update(asset);

            // write asset history
            const assetTxHash = String(log.transactionHash).toLowerCase();
            const assetHistory: IAssetHistory = {
              id: assetTxHash,
              txHash: assetTxHash,
              timestamp: block.timestamp,
              asset,
            };
            await this.assetHistoryService.add(assetHistory);

            // update totalBurn and totalSupply of collection
            collection.totalSupply = collection.totalSupply.sub(ONE_NUMBER);
            collection.totalBurned = collection.totalBurned.add(ONE_NUMBER);
            collection = await this.collectionService.update(collection);
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
          let asset = await this.assetService.getByTokenIdAndCollectionId(
            tokenId,
            collection.id
          );
          let previousUser = await this.userService.get(previousOwner);
          if (!previousUser) return;
          let newUser = await this.userService.getOrCreate(
            newOwner,
            block.timestamp
          );

          logger.info("=====transfer======");

          if (asset) {
            //
            if (asset.currentOwner && asset.currentOwner.id === newUser.id) {
              logger.info("===Already handled===");
              return;
            }

            // update asset
            asset.currentOwner = newUser;
            await this.assetService.update(asset);

            const assetTxHash = String(log.transactionHash).toLowerCase();
            const assetHistory: IAssetHistory = {
              id: assetTxHash,
              owner: newUser,
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

              const makerAsset = assetDataUtils.decodeAssetDataOrThrow(
                orderFillInfo.makerAssetData
              ) as any;
              const takerAsset = assetDataUtils.decodeAssetDataOrThrow(
                orderFillInfo.takerAssetData
              ) as any;
              const makerAssetProxyId = String(
                makerAsset.assetProxyId
              ).toLowerCase();
              const takerAssetProxyId = String(
                takerAsset.assetProxyId
              ).toLowerCase();

              if (
                makerAssetProxyId === ERC721_ASSET_PROXY_ID &&
                takerAssetProxyId === ERC20_ASSET_PROXY_ID
              ) {
                assetHistory.erc20 = String(
                  takerAsset.tokenAddress
                ).toLowerCase();
                assetHistory.erc20Amount = orderFillInfo.takerAssetFilledAmount;
              } else if (
                takerAssetProxyId === ERC721_ASSET_PROXY_ID &&
                makerAssetProxyId === ERC20_ASSET_PROXY_ID
              ) {
                assetHistory.erc20 = String(
                  makerAsset.tokenAddress
                ).toLowerCase();
                assetHistory.erc20Amount = orderFillInfo.makerAssetFilledAmount;
              }

              logger.info(
                `====Order Filled => txHash${assetHistory.erc20} ${assetHistory.erc20Amount}===`
              );
            }
            await this.assetHistoryService.add(assetHistory);
          }
        }
      }
    );
  }
}
