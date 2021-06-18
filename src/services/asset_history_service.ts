import * as _ from "lodash";

import { IAssetHistory } from "../types";
import { request } from "../shared/request";
import {
  deleteAllAssetHistory,
  insertAssetHistories,
  queryAssetHistoryByHash,
  updateAssetHistoryById,
} from "../shared/queries";
import { assetHistoryUtils } from "../utils/assetHistoryUtils";

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
    return assetHistoryUtils.toBNObj(records[0]);
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
    return assetHistoryUtils.toBNObj(
      response.update_asset_histories.returning[0]
    );
  }

  public async getByTxId(txHash: string): Promise<IAssetHistory | null> {
    const response = await request<QueryAssetHistoryData>(
      queryAssetHistoryByHash,
      { tx_hash: txHash }
    );
    if (response.asset_histories[0])
      return assetHistoryUtils.toBNObj(response.asset_histories[0]);
    return null;
  }

  private async _addRecordsAsync(
    history: IAssetHistory[]
  ): Promise<IAssetHistory[]> {
    const response = await request<InsertAssetHistoriesData>(
      insertAssetHistories,
      {
        asset_histories_data: history.map((history) =>
          assetHistoryUtils.toStrObj(history)
        ),
      }
    );
    return response.insert_asset_histories.returning.map((e) =>
      assetHistoryUtils.toBNObj(e)
    );
  }
}
