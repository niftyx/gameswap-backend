import { BigNumber } from "ethers";
import { AssetEntity, AssetHistoryEntity, UserEntity } from "../entities";
import { IAssetHistory } from "../types";
import { assetUtils } from "./asset_utils";
import { ZERO_NUMBER } from "./number";
import { userUtils } from "./user_utils";

export const assetHistoryUtils = {
  deserialize: (
    assetHistoryEntity: Required<AssetHistoryEntity>
  ): IAssetHistory => {
    const assetHistory: IAssetHistory = {
      id: assetHistoryEntity.id,
      owner: assetHistoryEntity.owner
        ? userUtils.deserialize(
            assetHistoryEntity.owner as Required<UserEntity>
          )
        : undefined,
      timestamp: assetHistoryEntity.timestamp,
      txHash: assetHistoryEntity.txHash,
      asset: assetHistoryEntity.asset
        ? assetUtils.deserialize(
            assetHistoryEntity.asset as Required<AssetEntity>
          )
        : undefined,
      erc20: assetHistoryEntity.erc20,
      erc20Amount: assetHistoryEntity.erc20Amount
        ? BigNumber.from(assetHistoryEntity.erc20Amount)
        : ZERO_NUMBER,
    };
    return assetHistory;
  },

  serialize: (assetHistory: IAssetHistory): AssetHistoryEntity => {
    const assetHistoryEntity = new AssetHistoryEntity({
      id: assetHistory.id,
      owner: assetHistory.owner
        ? userUtils.serialize(assetHistory.owner)
        : undefined,
      timestamp: assetHistory.timestamp,
      txHash: assetHistory.txHash,
      asset: assetHistory.asset
        ? assetUtils.serialize(assetHistory.asset)
        : undefined,
      erc20: assetHistory.erc20 || "",
      erc20Amount: (assetHistory.erc20Amount || ZERO_NUMBER).toString(),
    });
    return assetHistoryEntity;
  },
};
