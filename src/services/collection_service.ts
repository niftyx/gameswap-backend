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

  public async addCollection(collection: ICollection): Promise<ICollection> {
    const records = await this._addCollectionAsnyc([collection]);
    return records[0];
  }

  public async getCollection(id: string): Promise<ICollection> {
    const collectionEntity = (await this._connection.manager.findOne(
      CollectionEntity,
      id
    )) as Required<CollectionEntity>;

    const collection = collectionUtils.deserializeCollection(collectionEntity);

    return collection;
  }

  public async listCollections(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<ICollection>> {
    const collectionEntities = (await this._connection.manager.find(
      CollectionEntity
    )) as Required<CollectionEntity>[];
    const collectionItems = collectionEntities.map(
      collectionUtils.deserializeCollection
    );
    const paginatedCollections = paginationUtils.paginate(
      collectionItems,
      page,
      perPage
    );
    return paginatedCollections;
  }

  public async updateCollection(collection: ICollection): Promise<ICollection> {
    const records = (await this._connection
      .getRepository(CollectionEntity)
      .save(
        [collection].map(collectionUtils.serializeCollection)
      )) as Required<CollectionEntity>[];
    return collectionUtils.deserializeCollection(records[0]);
  }

  private async _addCollectionAsnyc(
    _collections: ICollection[]
  ): Promise<ICollection[]> {
    const records = await this._connection
      .getRepository(CollectionEntity)
      .save(_collections.map(collectionUtils.serializeCollection));
    return (records as Required<CollectionEntity>[]).map(
      collectionUtils.deserializeCollection
    );
  }
}
