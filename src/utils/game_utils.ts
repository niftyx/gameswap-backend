import { AssetEntity, GameEntity } from "../entities";
import { IGame, IPlatform } from "../types";
import { assetUtils } from "./asset_utils";

export const gameUtils = {
  deserialize: (gameEntity: Required<GameEntity>): IGame => {
    const game: IGame = {
      id: gameEntity.id,
      title: gameEntity.title,
      description: gameEntity.description,
      imageUrl: gameEntity.imageUrl,
      version: gameEntity.version,
      categoryId: gameEntity.categoryId,
      platform: JSON.parse(gameEntity.platform) as IPlatform[],
      owner: gameEntity.owner,
      createdAt: gameEntity.createdAt,
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
      title: game.title,
      description: game.description,
      imageUrl: game.imageUrl,
      version: game.version,
      categoryId: game.categoryId,
      platform: JSON.stringify(game.platform),
      owner: game.owner,
      createdAt: game.createdAt,
    });
    return gameEntity;
  },

  serializeGameAll: (game: IGame): GameEntity => {
    const gameEntity = new GameEntity({
      id: game.id,
      title: game.title,
      description: game.description,
      imageUrl: game.imageUrl,
      version: game.version,
      categoryId: game.categoryId,
      platform: JSON.stringify(game.platform),
      owner: game.owner,
      assets: game.assets ? game.assets.map(assetUtils.serialize) : undefined,
    });
    return gameEntity;
  },
};
