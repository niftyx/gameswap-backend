import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { CollectionHistoryEntity } from "../entities";
import { ICollectionHistory } from "../types";
import { collectionHistoryUtils } from "../utils/collection_history_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class CollectionHistoryService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async addHistory(
    history: ICollectionHistory
  ): Promise<ICollectionHistory> {
    const records = await this._addHistoryAsync([history]);
    return records[0];
  }

  public async getHistory(id: string): Promise<ICollectionHistory> {
    const collectionHistoryEntity = (await this._connection.manager.findOne(
      CollectionHistoryEntity,
      id
    )) as Required<CollectionHistoryEntity>;

    const history = collectionHistoryUtils.deserializeCollectionHistory(
      collectionHistoryEntity
    );

    return history;
  }

  public async listHistory(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<ICollectionHistory>> {
    const collectionHistoryEntities = (await this._connection.manager.find(
      CollectionHistoryEntity
    )) as Required<CollectionHistoryEntity>[];
    const history = collectionHistoryEntities.map(
      collectionHistoryUtils.deserializeCollectionHistory
    );
    const paginatedHistory = paginationUtils.paginate(history, page, perPage);
    return paginatedHistory;
  }

  private async _addHistoryAsync(
    _history: ICollectionHistory[]
  ): Promise<ICollectionHistory[]> {
    const records = await this._connection
      .getRepository(CollectionHistoryEntity)
      .save(_history.map(collectionHistoryUtils.serializeCollectionHistory));
    return (records as Required<CollectionHistoryEntity>[]).map(
      collectionHistoryUtils.deserializeCollectionHistory
    );
  }
}
