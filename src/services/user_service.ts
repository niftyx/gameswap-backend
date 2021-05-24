import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { UserEntity } from "../entities";
import { IUser } from "../types";
import { userUtils } from "../utils/user_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class UserService {
  private readonly connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async getOrCreate(id: string, timestamp: number): Promise<IUser> {
    const userEntity = await this.connection.manager.findOne(UserEntity, id);
    if (userEntity) {
      const user = userUtils.deserialize(userEntity as Required<UserEntity>);

      return user;
    }
    const user = await this.add({
      id,
      address: id,
      name: "",
      twitterUsername: "",
      twitterVerified: false,
      twitchUsername: "",
      facebookUsername: "",
      youtubeUsername: "",
      instagramUsername: "",
      tiktokUsername: "",
      imageUrl: "",
      headerImageUrl: "",
      customUrl: "",
      bio: "",
      personalSite: "",
      createTimestamp: timestamp,
      updateTimestamp: timestamp,
    });
    return user;
  }

  public async add(user: IUser): Promise<IUser> {
    const records = await this._addRecordsAsync([user]);
    return records[0];
  }

  public async update(user: IUser): Promise<IUser> {
    const records = (await this.connection
      .getRepository(UserEntity)
      .save([user].map(userUtils.serialize))) as Required<UserEntity>[];
    return userUtils.deserialize(records[0]);
  }

  public async get(id: string): Promise<IUser | null> {
    const userEntity = (await this.connection.manager.findOne(
      UserEntity,
      id
    )) as Required<UserEntity>;

    if (!userEntity) {
      return null;
    }

    const user = userUtils.deserialize(userEntity);

    return user;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IUser>> {
    const [entityCount, entities] = await Promise.all([
      this.connection.manager.count(UserEntity),
      this.connection.manager.find(UserEntity, {
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          createTimestamp: "ASC",
        },
      }),
    ]);
    const items = (entities as Required<UserEntity>[]).map(
      userUtils.deserialize
    );
    const paginatedItems = paginationUtils.paginateSerialize(
      items,
      entityCount,
      page,
      perPage
    );
    return paginatedItems;
  }

  private async _addRecordsAsync(users: IUser[]): Promise<IUser[]> {
    const records = await this.connection
      .getRepository(UserEntity)
      .save(users.map(userUtils.serialize));
    return (records as Required<UserEntity>[]).map(userUtils.deserialize);
  }
}
