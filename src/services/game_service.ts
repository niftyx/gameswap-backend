import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection, In } from "typeorm";
import { SEARCH_LIMIT } from "../constants";

import { GameEntity } from "../entities";
import { IGame } from "../types";
import { gameUtils } from "../utils/game_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class GameService {
  private readonly connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async add(game: IGame): Promise<IGame> {
    const records = await this._addRecordsAsnyc([game]);
    return records[0];
  }

  public async get(id: string): Promise<IGame | null> {
    const gameEntity = (await this.connection
      .getRepository(GameEntity)
      .findOne(id, { relations: ["owner"] })) as Required<GameEntity>;

    if (!gameEntity) {
      return null;
    }

    const game = gameUtils.deserialize(gameEntity);

    return game;
  }

  public async getMultipleGames(ids: string[]): Promise<IGame[]> {
    const gameEntities = await this.connection.getRepository(GameEntity).find({
      where: { id: In(ids) },
    });
    const games = gameEntities.map((entity) =>
      gameUtils.deserialize(entity as Required<GameEntity>)
    );
    return games;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IGame>> {
    const [entityCount, entities] = await Promise.all([
      this.connection.manager.count(GameEntity),
      this.connection.manager.find(GameEntity, {
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          createTimestamp: "ASC",
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

  public async search(_keyword: string): Promise<IGame[]> {
    const [entities] = await Promise.all([
      this.connection.manager.find(GameEntity, {
        take: SEARCH_LIMIT,
        order: {
          createTimestamp: "ASC",
        },
      }),
    ]);
    const gameItems = (entities as Required<GameEntity>[]).map(
      gameUtils.deserialize
    );

    return gameItems;
  }

  public async update(game: IGame): Promise<IGame> {
    const records = (await this.connection
      .getRepository(GameEntity)
      .save([game].map(gameUtils.serialize))) as Required<GameEntity>[];
    return gameUtils.deserialize(records[0]);
  }

  private async _addRecordsAsnyc(games: IGame[]): Promise<IGame[]> {
    const records = await this.connection
      .getRepository(GameEntity)
      .save(games.map(gameUtils.serialize));
    return (records as Required<GameEntity>[]).map(gameUtils.deserialize);
  }
}
