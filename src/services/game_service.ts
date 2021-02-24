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

  public async add(game: IGame): Promise<IGame> {
    const records = await this._addRecordsAsnyc([game]);
    return records[0];
  }

  public async get(id: string): Promise<IGame | null> {
    const gameEntity = (await this._connection.manager.findOne(
      GameEntity,
      id
    )) as Required<GameEntity>;

    if (!gameEntity) {
      return null;
    }

    const game = gameUtils.deserialize(gameEntity);

    return game;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IGame>> {
    const gameEntities = (await this._connection.manager.find(
      GameEntity
    )) as Required<GameEntity>[];
    const gameItems = gameEntities.map(gameUtils.deserialize);
    const paginatedGames = paginationUtils.paginate(gameItems, page, perPage);
    return paginatedGames;
  }

  private async _addRecordsAsnyc(games: IGame[]): Promise<IGame[]> {
    const records = await this._connection
      .getRepository(GameEntity)
      .save(games.map(gameUtils.serialize));
    return (records as Required<GameEntity>[]).map(gameUtils.deserialize);
  }
}
