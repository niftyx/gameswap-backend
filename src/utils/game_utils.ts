import { GameEntity } from "../entities";
import { IGame, IPlatform } from "../types";

export const gameUtils = {
  deserializeGame: (gameEntity: Required<GameEntity>): IGame => {
    const game: IGame = {
      id: gameEntity.id,
      title: gameEntity.title,
      description: gameEntity.description,
      imageUrl: gameEntity.imageUrl,
      version: gameEntity.version,
      categoryId: gameEntity.categoryId,
      platform: JSON.parse(gameEntity.platform) as IPlatform[],
      owner: gameEntity.owner,
    };
    return game;
  },

  serializeGame: (game: IGame): GameEntity => {
    const gameEntity = new GameEntity({
      id: game.id,
      title: game.title,
      description: game.description,
      imageUrl: game.imageUrl,
      version: game.version,
      categoryId: game.categoryId,
      platform: JSON.stringify(game.platform),
      owner: game.owner,
    });
    return gameEntity;
  },
};
