import * as _ from "lodash";
import { selectAccountById } from "../shared/helpers";
import { insertAccount, updateAccount, upsertAccount } from "../shared/queries";
import { request } from "../shared/request";
import { InsertAccountData } from "../shared/types";

import { IUser } from "../types";

export interface UpdateAccountData {
  update_users: {
    returning: IUser[];
  };
}

/**
 * UserService
 *
 * handles CRUD users to database using hasura
 */

export class UserService {
  public async upsert(id: string, timestamp: number) {
    await request<InsertAccountData>(upsertAccount, {
      user: {
        id: id,
        address: id,
        name: "",
        custom_url: "",
        image_url: "",
        header_image_url: "",
        bio: "",
        twitter_username: "",
        twitter_verified: false,
        twitch_username: "",
        facebook_username: "",
        youtube_username: "",
        instagram_username: "",
        tiktok_username: "",
        personal_site: "",
        create_time_stamp: timestamp,
        update_time_stamp: timestamp,
      },
    });
  }

  public async insert(id: string, timestamp: number): Promise<IUser> {
    const response = await request<InsertAccountData>(insertAccount, {
      user: {
        id: id,
        address: id,
        name: "",
        custom_url: "",
        image_url: "",
        header_image_url: "",
        bio: "",
        twitter_username: "",
        twitter_verified: false,
        twitch_username: "",
        facebook_username: "",
        youtube_username: "",
        instagram_username: "",
        tiktok_username: "",
        personal_site: "",
        create_time_stamp: timestamp,
        update_time_stamp: timestamp,
      },
    });
    return response.insert_users.returning[0];
  }

  public async update(user: IUser): Promise<IUser> {
    const response = await request<UpdateAccountData>(updateAccount, {
      id: user.id,
      changes: user,
    });
    return response.update_users.returning[0];
  }

  public async getOrCreate(id: string, timestamp: number): Promise<IUser> {
    const exist = await this.get(id);
    if (exist) {
      return exist;
    }
    const insertedItem = await this.insert(id, timestamp);
    return insertedItem;
  }

  public async get(id: string): Promise<IUser | null> {
    const response = await selectAccountById(id);
    return response;
  }
}
