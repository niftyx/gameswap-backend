import * as _ from "lodash";
import {
  insertGames,
  selectGamesById,
  updateGameById,
} from "../shared/queries";
import { request } from "../shared/request";

import { IGame } from "../types";

export interface QueryGameData {
  games: IGame[];
}

export interface InsertGameData {
  insert_games: {
    returning: IGame[];
  };
}

export interface UpdateGameData {
  update_games: {
    returning: IGame[];
  };
}

export class GameService {
  public async add(game: IGame): Promise<IGame> {
    const records = await this._addRecordsAsnyc([game]);
    return records[0];
  }

  public async update(game: IGame): Promise<IGame> {
    const response = await request<UpdateGameData>(updateGameById, {
      id: game.id,
      changes: game,
    });

    return response.update_games.returning[0];
  }

  public async get(id: string): Promise<IGame> {
    const response = await request<QueryGameData>(selectGamesById, { id });
    return response.games[0];
  }

  private async _addRecordsAsnyc(games: IGame[]): Promise<IGame[]> {
    const response = await request<InsertGameData>(insertGames, {
      games_data: games,
    });
    return response.insert_games.returning;
  }
}
