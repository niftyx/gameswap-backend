import { AssetEntity, CollectionEntity, GameEntity } from "../entities";
import { IGame, IPlatform } from "../types";
import { assetUtils } from "./asset_utils";
import { collectionUtils } from "./collection_utils";

export const gameUtils = {
  deserialize: (gameEntity: Required<GameEntity>): IGame => {
    const game: IGame = {
      id: gameEntity.id,
      name: gameEntity.name,
      description: gameEntity.description,
      imageUrl: gameEntity.imageUrl,
      headerImageUrl: gameEntity.headerImageUrl,
      version: gameEntity.version,
      categoryId: gameEntity.categoryId,
      platform: JSON.parse(gameEntity.platform) as IPlatform[],
      owner: gameEntity.owner,
      createdAt: gameEntity.createdAt,
      customUrl: gameEntity.customUrl,
      isVerified: gameEntity.isVerified,
      isPremium: gameEntity.isPremium,
      isFeatured: gameEntity.isFeatured,
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
    };
    return game;
  },

  serialize: (game: IGame): GameEntity => {
    const gameEntity = new GameEntity({
      id: game.id,
      name: game.name,
      description: game.description,
      imageUrl: game.imageUrl,
      headerImageUrl: game.headerImageUrl,
      version: game.version,
      categoryId: game.categoryId,
      platform: JSON.stringify(game.platform),
      owner: game.owner,
      isVerified: game.isVerified,
      isPremium: game.isPremium,
      isFeatured: game.isFeatured,
      createdAt: game.createdAt,
      customUrl: game.customUrl,
      assets: game.assets ? game.assets.map(assetUtils.serialize) : undefined,
      collections: game.collections
        ? game.collections.map(collectionUtils.serialize)
        : undefined,
    });
    return gameEntity;
  },
};
