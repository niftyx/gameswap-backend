import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { CollectionEntity } from "../entities";
import { ICollection } from "../types";
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

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<ICollection>> {
    const collectionEntities = (await this._connection.manager.find(
      CollectionEntity
    )) as Required<CollectionEntity>[];
    const collectionItems = collectionEntities.map(collectionUtils.deserialize);
    const paginatedCollections = paginationUtils.paginate(
      collectionItems,
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
