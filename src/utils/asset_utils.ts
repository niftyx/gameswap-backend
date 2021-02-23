import { BigNumber } from "ethers";
import {
  AccountEntity,
  AssetEntity,
  AssetHistoryEntity,
  CollectionEntity,
  ZeroXOrderEntity,
} from "../entities";
import { IAsset } from "../types";
import { accountUtils } from "./account_utils";
import { assetHistoryUtils } from "./asset_history_utils";
import { collectionUtils } from "./collection_utils";
import { zeroXOrderUtils } from "./zero_x_order_utils";

export const assetUtils = {
  deserializeAsset: (assetEntity: Required<AssetEntity>): IAsset => {
    const asset: IAsset = {
      id: assetEntity.id,
      assetId: BigNumber.from(assetEntity.assetId),
      assetURL: assetEntity.assetURL,
      gameId: assetEntity.gameId,
      categoryId: assetEntity.categoryId,
      contentId: assetEntity.contentId,
      createTimeStamp: assetEntity.createTimeStamp,
      updateTimeStamp: assetEntity.updateTimeStamp,
      currentOwner: assetEntity.currentOwner
        ? accountUtils.deserializeAccount(
            assetEntity.currentOwner as Required<AccountEntity>
          )
        : undefined,
      history: assetEntity.history
        ? assetEntity.history.map((historyEntity) =>
            assetHistoryUtils.deserializeAssetHistory(
              historyEntity as Required<AssetHistoryEntity>
            )
          )
        : undefined,
      collection: assetEntity.collection
        ? collectionUtils.deserializeCollection(
            assetEntity.collection as Required<CollectionEntity>
          )
        : undefined,
      orders: assetEntity.orders
        ? assetEntity.orders.map((order) =>
            zeroXOrderUtils.deserializeOrder(
              order as Required<ZeroXOrderEntity>
            )
          )
        : undefined,
    };
    return asset;
  },

  serializeAsset: (asset: IAsset): AssetEntity => {
    const assetEntity = new AssetEntity({
      id: asset.id,
      assetId: asset.assetId.toString(),
      assetURL: asset.assetURL,
      gameId: asset.gameId,
      categoryId: asset.categoryId,
      contentId: asset.contentId,
      createTimeStamp: asset.createTimeStamp,
      updateTimeStamp: asset.updateTimeStamp,
      currentOwner: asset.currentOwner
        ? accountUtils.serializeAccount(asset.currentOwner)
        : undefined,
      history: asset.history
        ? asset.history.map(assetHistoryUtils.serializeAssetHistory)
        : undefined,
      collection: asset.collection
        ? collectionUtils.serializeCollection(asset.collection)
        : undefined,
      orders: asset.orders
        ? asset.orders.map(zeroXOrderUtils.serializeOrder)
        : undefined,
    });
    return assetEntity;
  },
};
