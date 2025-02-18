import * as _ from "lodash";

import { IAsset } from "../types";
import { request } from "../shared/request";
import {
  deleteAllAssets,
  insertAssets,
  queryAssetsByAssetIdAndCollectionId,
  updateAssetByAssetId,
  queryAssetsByContentIdAndOwnerId,
} from "../shared/queries";
import { assetUtils } from "../utils/assetUtils";

export interface QueryAssetData {
  assets: IAsset[];
}

export interface InsertAssetData {
  insert_assets: {
    returning: IAsset[];
  };
}

export interface UpdateAssetData {
  update_assets: {
    returning: IAsset[];
  };
}

export class AssetService {
  public async add(asset: IAsset): Promise<IAsset> {
    const records = await this._addRecordsAsync([asset]);
    return records[0];
  }

  public async getByTokenIdAndCollectionId(
    assetId: string,
    collectionId: string
  ): Promise<IAsset | null> {
    const response = await request<QueryAssetData>(
      queryAssetsByAssetIdAndCollectionId,
      {
        asset_id: assetId,
        collection_id: collectionId,
      }
    );
    if (!response.assets[0]) return null;
    return assetUtils.toBNObj(response.assets[0]);
  }

  public async update(asset: IAsset): Promise<IAsset> {
    const response = await request<UpdateAssetData>(updateAssetByAssetId, {
      id: asset.id,
      changes: assetUtils.toStrObj(asset),
    });
    return assetUtils.toBNObj(response.update_assets.returning[0]);
  }

  public async deleteAll() {
    await request(deleteAllAssets);
  }

  public async getForContentData(
    contentId: string,
    ownerId: string
  ): Promise<IAsset | undefined> {
    const response = await request<QueryAssetData>(
      queryAssetsByContentIdAndOwnerId,
      {
        content_id: contentId,
        owner_id: ownerId,
      }
    );
    return response.assets[0];
  }

  private async _addRecordsAsync(assets: IAsset[]): Promise<IAsset[]> {
    const response = await request<InsertAssetData>(insertAssets, {
      assets_data: assets.map((asset: IAsset) => assetUtils.toStrObj(asset)),
    });
    return response.insert_assets.returning.map((asset) =>
      assetUtils.toBNObj(asset)
    );
  }
}
