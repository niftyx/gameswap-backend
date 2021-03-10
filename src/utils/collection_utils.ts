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
  deserialize: (collectionEntity: Required<CollectionEntity>): ICollection => {
    const collection: ICollection = {
      id: collectionEntity.id,
      block: collectionEntity.block,
      address: collectionEntity.address,
      name: collectionEntity.name,
      symbol: collectionEntity.symbol,
      imageUrl: collectionEntity.imageUrl,
      description: collectionEntity.description,
      owner: collectionEntity.owner,
      totalSupply: BigNumber.from(collectionEntity.totalSupply),
      totalMinted: BigNumber.from(collectionEntity.totalMinted),
      totalBurned: BigNumber.from(collectionEntity.totalBurned),
      createTimeStamp: collectionEntity.createTimeStamp,
      updateTimeStamp: collectionEntity.updateTimeStamp,
      assets: collectionEntity.assets
        ? collectionEntity.assets.map((asset) =>
            assetUtils.deserialize(asset as Required<AssetEntity>)
          )
        : undefined,
      history: collectionEntity.history
        ? collectionEntity.history.map((history) =>
            collectionHistoryUtils.deserialize(
              history as Required<CollectionHistoryEntity>
            )
          )
        : undefined,
    };
    return collection;
  },

  serialize: (collection: ICollection): CollectionEntity => {
    const gameEntity = new CollectionEntity({
      id: collection.id,
      block: collection.block,
      address: collection.address,
      name: collection.name,
      symbol: collection.symbol,
      imageUrl: collection.imageUrl,
      description: collection.description,
      owner: collection.owner,
      totalSupply: collection.totalSupply.toString(),
      totalMinted: collection.totalMinted.toString(),
      totalBurned: collection.totalBurned.toString(),
      createTimeStamp: collection.createTimeStamp,
      updateTimeStamp: collection.updateTimeStamp,
      assets: collection.assets
        ? collection.assets.map(assetUtils.serialize)
        : undefined,
      history: collection.history
        ? collection.history.map(collectionHistoryUtils.serialize)
        : undefined,
    });
    return gameEntity;
  },
};
