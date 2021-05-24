import * as _ from "lodash";
import { Connection } from "typeorm";
import { BANNED_CUSTOM_URLS } from "../constants";
import { UserEntity, GameEntity } from "../entities";

export class CommonService {
  private readonly connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async checkCustomUrlUsable(url: string): Promise<boolean> {
    if (url === "") return true;
    if (!url.match(/^[a-zA-Z0-9\-_]+$/)) return false;
    if (BANNED_CUSTOM_URLS.includes(url)) {
      return false;
    }
    let isExist = await this.connection.getRepository(UserEntity).findOne({
      customUrl: url,
    });
    if (isExist) {
      return false;
    }
    isExist = await this.connection.getRepository(GameEntity).findOne({
      customUrl: url,
    });
    if (isExist) {
      return false;
    }
    return true;
  }

  public async getCustomUrlInfo(
    url: string
  ): Promise<null | { customId: string; isGame: boolean; isUser: boolean }> {
    if (url === "") return null;
    if (!url.match(/^[a-zA-Z0-9\-_]+$/)) return null;
    if (BANNED_CUSTOM_URLS.includes(url)) {
      return null;
    }
    let isExist = await this.connection.getRepository(UserEntity).findOne({
      customUrl: url,
    });
    if (isExist) {
      return { isGame: false, isUser: true, customId: isExist.id || "" };
    }
    isExist = await this.connection.getRepository(GameEntity).findOne({
      customUrl: url,
    });
    if (isExist) {
      return { isGame: true, isUser: false, customId: isExist.id || "" };
    }
    return null;
  }
}
