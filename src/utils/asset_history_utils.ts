import { AssetEntity, AssetHistoryEntity } from "../entities";
import { IAssetHistory } from "../types";
import { assetUtils } from "./asset_utils";

export const assetHistoryUtils = {
  deserialize: (
    assetHistoryEntity: Required<AssetHistoryEntity>
  ): IAssetHistory => {
    const assetHistory: IAssetHistory = {
      id: assetHistoryEntity.id,
      owner: assetHistoryEntity.owner,
      timestamp: assetHistoryEntity.timestamp,
      txHash: assetHistoryEntity.txHash,
      asset: assetHistoryEntity.asset
        ? assetUtils.deserialize(
            assetHistoryEntity.asset as Required<AssetEntity>
          )
        : undefined,
    };
    return assetHistory;
  },

  serialize: (assetHistory: IAssetHistory): AssetHistoryEntity => {
    const assetHistoryEntity = new AssetHistoryEntity({
      id: assetHistory.id,
      owner: assetHistory.owner,
      timestamp: assetHistory.timestamp,
      txHash: assetHistory.txHash,
      asset: assetHistory.asset
        ? assetUtils.serialize(assetHistory.asset)
        : undefined,
    });
    return assetHistoryEntity;
  },
};
