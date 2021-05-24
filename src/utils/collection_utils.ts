import { BigNumber } from "ethers";
import {
  AssetEntity,
  CollectionEntity,
  CollectionHistoryEntity,
  GameEntity,
  UserEntity,
} from "../entities";
import { ICollection } from "../types";
import { assetUtils } from "./asset_utils";
import { collectionHistoryUtils } from "./collection_history_utils";
import { gameUtils } from "./game_utils";
import { userUtils } from "./user_utils";

export const collectionUtils = {
  deserialize: (collectionEntity: Required<CollectionEntity>): ICollection => {
    const collection: ICollection = {
      id: collectionEntity.id,
      address: collectionEntity.address,
      name: collectionEntity.name,
      symbol: collectionEntity.symbol,
      imageUrl: collectionEntity.imageUrl,
      description: collectionEntity.description,
      totalSupply: BigNumber.from(collectionEntity.totalSupply),
      totalMinted: BigNumber.from(collectionEntity.totalMinted),
      totalBurned: BigNumber.from(collectionEntity.totalBurned),
      block: collectionEntity.block,
      isPrivate: collectionEntity.isPrivate,
      isVerified: collectionEntity.isVerified,
      isPremium: collectionEntity.isPremium,
      isFeatured: collectionEntity.isFeatured,
      createTimestamp: collectionEntity.createTimestamp,
      updateTimestamp: collectionEntity.updateTimestamp,
      owner: collectionEntity.owner
        ? userUtils.deserialize(collectionEntity.owner as Required<UserEntity>)
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
      games: collectionEntity.games
        ? collectionEntity.games.map((game) =>
            gameUtils.deserialize(game as Required<GameEntity>)
          )
        : undefined,
    };
    return collection;
  },

  serialize: (collection: ICollection): CollectionEntity => {
    const gameEntity = new CollectionEntity({
      id: collection.id,
      address: collection.address,
      name: collection.name,
      symbol: collection.symbol,
      imageUrl: collection.imageUrl,
      description: collection.description,
      totalSupply: collection.totalSupply.toString(),
      totalMinted: collection.totalMinted.toString(),
      totalBurned: collection.totalBurned.toString(),
      block: collection.block,
      isPrivate: collection.isPrivate,
      isVerified: collection.isVerified,
      isPremium: collection.isPremium,
      isFeatured: collection.isFeatured,
      createTimestamp: collection.createTimestamp,
      updateTimestamp: collection.updateTimestamp,
      owner: collection.owner
        ? userUtils.serialize(collection.owner)
        : undefined,
      assets: collection.assets
        ? collection.assets.map(assetUtils.serialize)
        : undefined,
      history: collection.history
        ? collection.history.map(collectionHistoryUtils.serialize)
        : undefined,
      games: collection.games
        ? collection.games.map(gameUtils.serialize)
        : undefined,
    });
    return gameEntity;
  },
};
