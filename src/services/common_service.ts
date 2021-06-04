import * as _ from "lodash";
import { BANNED_CUSTOM_URLS } from "../constants";
import { IGame, IUser } from "../types";
import { request } from "../shared/request";
import { queryUsersAndGamesByCustomUrl } from "../shared/queries";

export interface QueryUsersAndGamesByCustomUrlData {
  users: IUser[];
  games: IGame[];
}

export class CommonService {
  public async checkCustomUrlUsable(url: string): Promise<boolean> {
    if (url === "") return true;
    if (!url.match(/^[a-zA-Z0-9\-_]+$/)) return false;
    if (BANNED_CUSTOM_URLS.includes(url)) {
      return false;
    }

    const response = await request<QueryUsersAndGamesByCustomUrlData>(
      queryUsersAndGamesByCustomUrl,
      {
        url,
      }
    );
    const isExist = response.games.length > 0 || response.users.length > 0;

    return !isExist;
  }
}
