import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";
import { SEARCH_LIMIT } from "../constants";

import { CollectionEntity, GameEntity } from "../entities";
import { ICollection } from "../types";
import { collectionUtils } from "../utils/collection_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class CollectionService {
  private readonly connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async add(collection: ICollection): Promise<ICollection> {
    const records = await this._addRecordsAsnyc([collection]);
    return records[0];
  }

  public async get(id: string): Promise<ICollection | null> {
    const collectionEntity = (await this.connection.manager.findOne(
      CollectionEntity,
      id
    )) as Required<CollectionEntity>;

    if (!collectionEntity) {
      return null;
    }

    const collection = collectionUtils.deserialize(collectionEntity);

    return collection;
  }

  public async search(_keyword: string): Promise<ICollection[]> {
    const [entities] = await Promise.all([
      this.connection.manager.find(CollectionEntity, {
        take: SEARCH_LIMIT,
        order: {
          createTimestamp: "ASC",
        },
      }),
    ]);
    const collectionItems = (entities as Required<CollectionEntity>[]).map(
      collectionUtils.deserialize
    );

    return collectionItems;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<ICollection>> {
    const [entityCount, entities] = await Promise.all([
      this.connection.manager.count(CollectionEntity),
      this.connection.manager.find(CollectionEntity, {
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          createTimestamp: "ASC",
        },
      }),
    ]);
    const collectionItems = (entities as Required<CollectionEntity>[]).map(
      collectionUtils.deserialize
    );
    const paginatedCollections = paginationUtils.paginateSerialize(
      collectionItems,
      entityCount,
      page,
      perPage
    );
    return paginatedCollections;
  }

  public async listRelatedToGame(
    page: number,
    perPage: number,
    gameId: string
  ): Promise<PaginatedCollection<ICollection>> {
    const gameEntity = (await this.connection
      .getRepository(GameEntity)
      .findOne({
        where: { id: gameId },
        relations: ["collections"],
      })) as Required<GameEntity>;
    const collections = gameEntity.collections.map((entity) =>
      collectionUtils.deserialize(entity as Required<CollectionEntity>)
    );
    const paginatedCollections = paginationUtils.paginate(
      collections,
      page,
      perPage
    );
    return paginatedCollections;
  }

  public async update(collection: ICollection): Promise<ICollection> {
    const records = (await this.connection
      .getRepository(CollectionEntity)
      .save(
        [collection].map(collectionUtils.serialize)
      )) as Required<CollectionEntity>[];
    return collectionUtils.deserialize(records[0]);
  }

  private async _addRecordsAsnyc(
    _collections: ICollection[]
  ): Promise<ICollection[]> {
    const records = await this.connection
      .getRepository(CollectionEntity)
      .save(_collections.map(collectionUtils.serialize));
    return (records as Required<CollectionEntity>[]).map(
      collectionUtils.deserialize
    );
  }
}
