import { BigNumber } from "ethers";
import {
  AssetEntity,
  CollectionEntity,
  CollectionHistoryEntity,
} from "../entities";
import { ICollection } from "../types";
import { assetUtils } from "./asset_utils";
import { collectionHistoryUtils } from "./collection_history_utils";

export const collectionUtils = {
  deserializeCollection: (
    collectionEntity: Required<CollectionEntity>
  ): ICollection => {
    const collection: ICollection = {
      id: collectionEntity.id,
      block: collectionEntity.block,
      address: collectionEntity.address,
      name: collectionEntity.name,
      symbol: collectionEntity.symbol,
      imageUrl: collectionEntity.imageUrl,
      description: collectionEntity.description,
      shortUrl: collectionEntity.shortUrl,
      owner: collectionEntity.owner,
      totalSupply: BigNumber.from(collectionEntity.totalSupply),
      totalMinted: BigNumber.from(collectionEntity.totalMinted),
      totalBurned: BigNumber.from(collectionEntity.totalBurned),
      createTimeStamp: collectionEntity.createTimeStamp,
      updateTimeStamp: collectionEntity.updateTimeStamp,
      assets: collectionEntity.assets
        ? collectionEntity.assets.map((asset) =>
            assetUtils.deserializeAsset(asset as Required<AssetEntity>)
          )
        : undefined,
      history: collectionEntity.history
        ? collectionEntity.history.map((history) =>
            collectionHistoryUtils.deserializeCollectionHistory(
              history as Required<CollectionHistoryEntity>
            )
          )
        : undefined,
    };
    return collection;
  },

  serializeCollection: (collection: ICollection): CollectionEntity => {
    const gameEntity = new CollectionEntity({
      id: collection.id,
      block: collection.block,
      address: collection.address,
      name: collection.name,
      symbol: collection.symbol,
      imageUrl: collection.imageUrl,
      description: collection.description,
      shortUrl: collection.shortUrl,
      owner: collection.owner,
      totalSupply: collection.totalSupply.toString(),
      totalMinted: collection.totalMinted.toString(),
      totalBurned: collection.totalBurned.toString(),
      createTimeStamp: collection.createTimeStamp,
      updateTimeStamp: collection.updateTimeStamp,
      assets: collection.assets
        ? collection.assets.map(assetUtils.serializeAsset)
        : undefined,
      history: collection.history
        ? collection.history.map(
            collectionHistoryUtils.serializeCollectionHistory
          )
        : undefined,
    });
    return gameEntity;
  },
};
