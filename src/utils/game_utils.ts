import { AssetEntity, GameEntity } from "../entities";
import { IGame, IPlatform } from "../types";
import { assetUtils } from "./asset_utils";

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
      assets: gameEntity.assets
        ? gameEntity.assets.map((assetEntity) =>
            assetUtils.deserialize(assetEntity as Required<AssetEntity>)
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
      createdAt: game.createdAt,
      customUrl: game.customUrl,
      assets: game.assets ? game.assets.map(assetUtils.serialize) : undefined,
    });
    return gameEntity;
  },
};
