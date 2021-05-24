import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { AssetHistoryEntity } from "../entities";
import { IAssetHistory } from "../types";
import { assetHistoryUtils } from "../utils/asset_history_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class AssetHistoryService {
  private readonly connection: Connection;
  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async add(history: IAssetHistory): Promise<IAssetHistory> {
    const records = await this._addRecordsAsync([history]);
    return records[0];
  }

  public async getByTxId(txId: string): Promise<IAssetHistory | null> {
    const assetHistoryEntity = (await this.connection
      .getRepository(AssetHistoryEntity)
      .findOne({ txHash: txId })) as Required<AssetHistoryEntity>;

    if (!assetHistoryEntity) {
      return null;
    }

    const history = assetHistoryUtils.deserialize(assetHistoryEntity);

    return history;
  }

  public async get(id: string): Promise<IAssetHistory | null> {
    const assetHistoryEntity = (await this.connection.manager.findOne(
      AssetHistoryEntity,
      id
    )) as Required<AssetHistoryEntity>;

    if (!assetHistoryEntity) {
      return null;
    }

    const history = assetHistoryUtils.deserialize(assetHistoryEntity);

    return history;
  }

  public async update(history: IAssetHistory): Promise<IAssetHistory> {
    const records = (await this.connection
      .getRepository(AssetHistoryEntity)
      .save(
        [history].map(assetHistoryUtils.serialize)
      )) as Required<AssetHistoryEntity>[];
    return assetHistoryUtils.deserialize(records[0]);
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAssetHistory>> {
    const [entityCount, entities] = await Promise.all([
      this.connection.manager.count(AssetHistoryEntity),
      this.connection.manager.find(AssetHistoryEntity, {
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          timestamp: "ASC",
        },
      }),
    ]);
    const history = (entities as Required<AssetHistoryEntity>[]).map(
      assetHistoryUtils.deserialize
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
    _history: IAssetHistory[]
  ): Promise<IAssetHistory[]> {
    const records = await this.connection
      .getRepository(AssetHistoryEntity)
      .save(_history.map(assetHistoryUtils.serialize));
    return (records as Required<AssetHistoryEntity>[]).map(
      assetHistoryUtils.deserialize
    );
  }
}
