import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";
import { SEARCH_LIMIT } from "../constants";

import { AssetEntity, CollectionEntity } from "../entities";
import { ICollection } from "../types";
import { assetUtils } from "../utils/asset_utils";
import { collectionUtils } from "../utils/collection_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class CollectionService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async add(collection: ICollection): Promise<ICollection> {
    const records = await this._addRecordsAsnyc([collection]);
    return records[0];
  }

  public async get(id: string): Promise<ICollection | null> {
    const collectionEntity = (await this._connection.manager.findOne(
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
      this._connection.manager.find(CollectionEntity, {
        take: SEARCH_LIMIT,
        order: {
          createTimeStamp: "ASC",
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
      this._connection.manager.count(CollectionEntity),
      this._connection.manager.find(CollectionEntity, {
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          createTimeStamp: "ASC",
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
    const assetEntities = (await this._connection
      .getRepository(AssetEntity)
      .find({
        where: { gameId },
        relations: ["collection"],
        order: { createTimeStamp: "DESC" },
      })) as Required<AssetEntity>[];
    const assetItems = assetEntities.map(assetUtils.deserialize);
    const collectionItems = assetItems.map(
      (asset) => asset.collection as Required<ICollection>
    );
    const collectionIds = collectionItems.map((collection) => collection.id);
    const uniqueCollections = collectionItems.filter(
      (collection, index) => index === collectionIds.indexOf(collection.id)
    );
    const paginatedCollections = paginationUtils.paginate(
      uniqueCollections,
      page,
      perPage
    );
    return paginatedCollections;
  }

  public async update(collection: ICollection): Promise<ICollection> {
    const records = (await this._connection
      .getRepository(CollectionEntity)
      .save(
        [collection].map(collectionUtils.serialize)
      )) as Required<CollectionEntity>[];
    return collectionUtils.deserialize(records[0]);
  }

  private async _addRecordsAsnyc(
    _collections: ICollection[]
  ): Promise<ICollection[]> {
    const records = await this._connection
      .getRepository(CollectionEntity)
      .save(_collections.map(collectionUtils.serialize));
    return (records as Required<CollectionEntity>[]).map(
      collectionUtils.deserialize
    );
  }
}
