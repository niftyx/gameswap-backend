import { BigNumber } from "ethers";
import {
  AssetEntity,
  CollectionEntity,
  CollectionHistoryEntity,
  GameEntity,
} from "../entities";
import { ICollection } from "../types";
import { assetUtils } from "./asset_utils";
import { collectionHistoryUtils } from "./collection_history_utils";
import { gameUtils } from "./game_utils";

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
      gameIds: collectionEntity.gameIds.split(","),
      totalSupply: BigNumber.from(collectionEntity.totalSupply),
      totalMinted: BigNumber.from(collectionEntity.totalMinted),
      totalBurned: BigNumber.from(collectionEntity.totalBurned),
      createTimeStamp: collectionEntity.createTimeStamp,
      updateTimeStamp: collectionEntity.updateTimeStamp,
      isPrivate: collectionEntity.isPrivate,
      isVerified: collectionEntity.isVerified,
      isPremium: collectionEntity.isPremium,
      isFeatured: collectionEntity.isFeatured,
      games: collectionEntity.games
        ? collectionEntity.games.map((game) =>
            gameUtils.deserialize(game as Required<GameEntity>)
          )
        : undefined,
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
      isPrivate: collection.isPrivate,
      gameIds: collection.gameIds.join(","),
      owner: collection.owner,
      totalSupply: collection.totalSupply.toString(),
      totalMinted: collection.totalMinted.toString(),
      totalBurned: collection.totalBurned.toString(),
      createTimeStamp: collection.createTimeStamp,
      updateTimeStamp: collection.updateTimeStamp,
      isVerified: collection.isVerified,
      isPremium: collection.isPremium,
      isFeatured: collection.isFeatured,
      assets: collection.assets
        ? collection.assets.map(assetUtils.serialize)
        : undefined,
      games: collection.games
        ? collection.games.map(gameUtils.serialize)
        : undefined,
      history: collection.history
        ? collection.history.map(collectionHistoryUtils.serialize)
        : undefined,
    });
    return gameEntity;
  },
};
