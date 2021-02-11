import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { GameEntity } from "../entities";
import { IGame } from "../types";
import { gameUtils } from "../utils/game_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class GameService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async addGame(game: IGame): Promise<IGame> {
    const records = await this._addGameAsnyc([game]);
    return records[0];
  }

  public async getGame(id: string): Promise<IGame> {
    const gameEntity = (await this._connection.manager.findOne(
      GameEntity,
      id
    )) as Required<GameEntity>;

    const game = gameUtils.deserializeGame(gameEntity);

    return game;
  }

  public async listGames(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IGame>> {
    const gameEntities = (await this._connection.manager.find(
      GameEntity
    )) as Required<GameEntity>[];
    const gameItems = gameEntities.map(gameUtils.deserializeGame);
    const paginatedGames = paginationUtils.paginate(gameItems, page, perPage);
    return paginatedGames;
  }

  private async _addGameAsnyc(games: IGame[]): Promise<IGame[]> {
    const records = await this._connection
      .getRepository(GameEntity)
      .save(games.map(gameUtils.serializeGame));
    return (records as Required<GameEntity>[]).map(gameUtils.deserializeGame);
  }
}
