import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { AssetHistoryEntity } from "../entities";
import { IAssetHistory } from "../types";
import { assetHistoryUtils } from "../utils/asset_history_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class AssetHistoryService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async add(history: IAssetHistory): Promise<IAssetHistory> {
    const records = await this._addRecordsAsync([history]);
    return records[0];
  }

  public async get(id: string): Promise<IAssetHistory | null> {
    const assetHistoryEntity = (await this._connection.manager.findOne(
      AssetHistoryEntity,
      id
    )) as Required<AssetHistoryEntity>;

    if (!assetHistoryEntity) {
      return null;
    }

    const history = assetHistoryUtils.deserialize(assetHistoryEntity);

    return history;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAssetHistory>> {
    const assetHistoryEntities = (await this._connection.manager.find(
      AssetHistoryEntity
    )) as Required<AssetHistoryEntity>[];
    const history = assetHistoryEntities.map(assetHistoryUtils.deserialize);
    const paginatedHistory = paginationUtils.paginate(history, page, perPage);
    return paginatedHistory;
  }

  private async _addRecordsAsync(
    _history: IAssetHistory[]
  ): Promise<IAssetHistory[]> {
    const records = await this._connection
      .getRepository(AssetHistoryEntity)
      .save(_history.map(assetHistoryUtils.serialize));
    return (records as Required<AssetHistoryEntity>[]).map(
      assetHistoryUtils.deserialize
    );
  }
}
