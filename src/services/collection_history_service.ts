import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { CollectionHistoryEntity } from "../entities";
import { ICollectionHistory } from "../types";
import { collectionHistoryUtils } from "../utils/collection_history_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class CollectionHistoryService {
  private readonly connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async add(history: ICollectionHistory): Promise<ICollectionHistory> {
    const records = await this._addRecordsAsync([history]);
    return records[0];
  }

  public async get(id: string): Promise<ICollectionHistory | null> {
    const collectionHistoryEntity = (await this.connection.manager.findOne(
      CollectionHistoryEntity,
      id
    )) as Required<CollectionHistoryEntity>;

    if (!collectionHistoryEntity) {
      return null;
    }

    const history = collectionHistoryUtils.deserialize(collectionHistoryEntity);

    return history;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<ICollectionHistory>> {
    const [entityCount, entities] = await Promise.all([
      this.connection.manager.count(CollectionHistoryEntity),
      this.connection.manager.find(CollectionHistoryEntity, {
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          timestamp: "ASC",
        },
      }),
    ]);
    const history = (entities as Required<CollectionHistoryEntity>[]).map(
      collectionHistoryUtils.deserialize
    );
    const paginatedHistory = paginationUtils.paginateSerialize(
      history,
      entityCount,
      page,
      perPage
    );
    return paginatedHistory;
  }

  public async listByCollectionId(
    collectionId: string,
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<ICollectionHistory>> {
    const [entityCount, entities] = await Promise.all([
      this.connection.manager.count(CollectionHistoryEntity, {
        where: { id: collectionId },
      }),
      this.connection.manager.find(CollectionHistoryEntity, {
        where: { id: collectionId },
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          timestamp: "ASC",
        },
      }),
    ]);
    const history = (entities as Required<CollectionHistoryEntity>[]).map(
      collectionHistoryUtils.deserialize
    );
    const paginatedHistory = paginationUtils.paginateSerialize(
      history,
      entityCount,
      page,
      perPage
    );
    return paginatedHistory;
  }

  private async _addRecordsAsync(
    _history: ICollectionHistory[]
  ): Promise<ICollectionHistory[]> {
    const records = await this.connection
      .getRepository(CollectionHistoryEntity)
      .save(_history.map(collectionHistoryUtils.serialize));
    return (records as Required<CollectionHistoryEntity>[]).map(
      collectionHistoryUtils.deserialize
    );
  }
}
