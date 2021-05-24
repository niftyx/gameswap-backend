import {
  AssetEntity,
  CollectionEntity,
  GameEntity,
  UserEntity,
} from "../entities";
import { IGame, IPlatform } from "../types";
import { assetUtils } from "./asset_utils";
import { collectionUtils } from "./collection_utils";
import { userUtils } from "./user_utils";

export const gameUtils = {
  deserialize: (gameEntity: Required<GameEntity>): IGame => {
    const game: IGame = {
      id: gameEntity.id,
      name: gameEntity.name,
      customUrl: gameEntity.customUrl,
      version: gameEntity.version,
      imageUrl: gameEntity.imageUrl,
      headerImageUrl: gameEntity.headerImageUrl,
      categoryId: gameEntity.categoryId,
      description: gameEntity.description,
      platform: JSON.parse(gameEntity.platform) as IPlatform[],
      isVerified: gameEntity.isVerified,
      isPremium: gameEntity.isPremium,
      isFeatured: gameEntity.isFeatured,
      createTimestamp: gameEntity.createTimestamp,
      updateTimestamp: gameEntity.updateTimestamp,
      owner: gameEntity.owner
        ? userUtils.deserialize(gameEntity.owner as Required<UserEntity>)
        : undefined,

      assets: gameEntity.assets
        ? gameEntity.assets.map((assetEntity) =>
            assetUtils.deserialize(assetEntity as Required<AssetEntity>)
          )
        : undefined,
      collections: gameEntity.collections
        ? gameEntity.collections.map((collectionEntity) =>
            collectionUtils.deserialize(
              collectionEntity as Required<CollectionEntity>
            )
          )
        : undefined,
      followers: gameEntity.followers
        ? gameEntity.followers.map((userEntity) =>
            userUtils.deserialize(userEntity as Required<UserEntity>)
          )
        : undefined,
    };
    return game;
  },

  serialize: (game: IGame): GameEntity => {
    const gameEntity = new GameEntity({
      id: game.id,
      name: game.name,
      customUrl: game.customUrl,
      version: game.version,
      imageUrl: game.imageUrl,
      headerImageUrl: game.headerImageUrl,
      categoryId: game.categoryId,
      description: game.description,
      platform: JSON.stringify(game.platform),
      isVerified: game.isVerified,
      isPremium: game.isPremium,
      isFeatured: game.isFeatured,
      createTimestamp: game.createTimestamp,
      updateTimestamp: game.updateTimestamp,
      owner: game.owner ? userUtils.serialize(game.owner) : undefined,
      assets: game.assets ? game.assets.map(assetUtils.serialize) : undefined,
      collections: game.collections
        ? game.collections.map(collectionUtils.serialize)
        : undefined,
      followers: game.followers
        ? game.followers.map(userUtils.serialize)
        : undefined,
    });
    return gameEntity;
  },
};
