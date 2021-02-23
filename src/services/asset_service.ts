import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";
import { logger } from "../app";

import { AssetEntity } from "../entities";
import { IAsset } from "../types";
import { assetUtils } from "../utils/asset_utils";
import { paginationUtils } from "../utils/pagination_utils";

export class AssetService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async addAsset(asset: IAsset): Promise<IAsset> {
    const records = await this._addAssetsAsync([asset]);
    return records[0];
  }

  public async getAsset(id: string): Promise<IAsset> {
    const assetEntity = (await this._connection.manager.findOne(
      AssetEntity,
      id
    )) as Required<AssetEntity>;

    const asset = assetUtils.deserializeAsset(assetEntity);

    return asset;
  }

  public async listAssets(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAsset>> {
    const assetEntities = (await this._connection.manager.find(
      AssetEntity
    )) as Required<AssetEntity>[];
    const assetItems = assetEntities.map(assetUtils.deserializeAsset);
    const paginatedAssets = paginationUtils.paginate(assetItems, page, perPage);
    return paginatedAssets;
  }

  public async updateAccount(asset: IAsset): Promise<IAsset> {
    const records = (await this._connection
      .getRepository(AssetEntity)
      .save([asset].map(assetUtils.serializeAsset))) as Required<AssetEntity>[];
    return assetUtils.deserializeAsset(records[0]);
  }

  private async _addAssetsAsync(_assets: IAsset[]): Promise<IAsset[]> {
    logger.info(_assets);
    const records = await this._connection
      .getRepository(AssetEntity)
      .save(_assets.map(assetUtils.serializeAsset));
    return (records as Required<AssetEntity>[]).map(
      assetUtils.deserializeAsset
    );
  }
}
