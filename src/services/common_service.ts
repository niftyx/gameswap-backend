import * as _ from "lodash";
import { Connection } from "typeorm";
import { BANNED_CUSTOM_URLS } from "../constants";
import { AccountEntity, GameEntity } from "../entities";

export class CommonService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async checkCustomUrlUsable(url: string): Promise<boolean> {
    if (url === "") return true;
    if (!url.match(/^[a-zA-Z0-9\-_]+$/)) return false;
    if (BANNED_CUSTOM_URLS.includes(url)) {
      return false;
    }
    let isExist = await this._connection.getRepository(AccountEntity).findOne({
      customUrl: url,
    });
    if (isExist) {
      return false;
    }
    isExist = await this._connection.getRepository(GameEntity).findOne({
      customUrl: url,
    });
    if (isExist) {
      return false;
    }
    return true;
  }
}
