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
  ): Promise<IAsset> {
    const response = await request<QueryAssetData>(
      queryAssetsByAssetIdAndCollectionId,
      {
        asset_id: assetId,
        collection_id: collectionId,
      }
    );
    return response.assets[0];
  }

  public async update(asset: IAsset): Promise<IAsset> {
    const response = await request<UpdateAssetData>(updateAssetByAssetId, {
      id: asset.id,
      changes: asset,
    });
    return response.update_assets.returning[0];
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
      assets_data: assets,
    });
    return response.insert_assets.returning;
  }
}
