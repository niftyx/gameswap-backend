import * as _ from "lodash";

import { request } from "../shared/request";
import {
  deleteAllCollectionHistory,
  insertCollectionHistories,
} from "../shared/queries";

import { ICollectionHistory } from "../types";

export interface InsertCollectionHistoriesData {
  insert_collection_histories: {
    returning: ICollectionHistory[];
  };
}
export class CollectionHistoryService {
  public async add(history: ICollectionHistory): Promise<ICollectionHistory> {
    const records = await this._addRecordsAsync([history]);
    return records[0];
  }

  public async deleteAll() {
    await request(deleteAllCollectionHistory);
  }

  private async _addRecordsAsync(
    history: ICollectionHistory[]
  ): Promise<ICollectionHistory[]> {
    const response = await request<InsertCollectionHistoriesData>(
      insertCollectionHistories,
      {
        collection_histories_data: history,
      }
    );
    return response.insert_collection_histories.returning;
  }
}
