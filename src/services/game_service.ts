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
    const [entityCount, entities] = await Promise.all([
      this._connection.manager.count(GameEntity),
      this._connection.manager.find(GameEntity, {
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          createdAt: "ASC",
        },
      }),
    ]);
    const gameItems = (entities as Required<GameEntity>[]).map(
      gameUtils.deserialize
    );
    const paginatedGames = paginationUtils.paginateSerialize(
      gameItems,
      entityCount,
      page,
      perPage
    );
    return paginatedGames;
  }

  private async _addRecordsAsnyc(games: IGame[]): Promise<IGame[]> {
    const records = await this._connection
      .getRepository(GameEntity)
      .save(games.map(gameUtils.serialize));
    return (records as Required<GameEntity>[]).map(gameUtils.deserialize);
  }
}
