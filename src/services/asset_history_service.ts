import * as _ from "lodash";

import { IAssetHistory } from "../types";
import { request } from "../shared/request";
import {
  deleteAllAssetHistory,
  insertAssetHistories,
  queryAssetHistoryByHash,
  updateAssetHistoryById,
} from "../shared/queries";

export interface InsertAssetHistoriesData {
  insert_asset_histories: {
    returning: IAssetHistory[];
  };
}

export interface QueryAssetHistoryData {
  asset_histories: IAssetHistory[];
}

export interface UpdateAssetHistoryData {
  update_asset_histories: {
    returning: IAssetHistory[];
  };
}

export class AssetHistoryService {
  public async add(history: IAssetHistory): Promise<IAssetHistory> {
    const records = await this._addRecordsAsync([history]);
    return records[0];
  }

  public async deleteAll() {
    await request(deleteAllAssetHistory);
  }

  public async update(history: IAssetHistory): Promise<IAssetHistory> {
    const response = await request<UpdateAssetHistoryData>(
      updateAssetHistoryById,
      {
        id: history.id,
        changes: history,
      }
    );
    return response.update_asset_histories.returning[0];
  }

  public async getByTxId(txHash: string): Promise<IAssetHistory> {
    const response = await request<QueryAssetHistoryData>(
      queryAssetHistoryByHash,
      { tx_hash: txHash }
    );
    return response.asset_histories[0];
  }

  private async _addRecordsAsync(
    history: IAssetHistory[]
  ): Promise<IAssetHistory[]> {
    const response = await request<InsertAssetHistoriesData>(
      insertAssetHistories,
      {
        asset_histories_data: history,
      }
    );
    return response.insert_asset_histories.returning;
  }
}
