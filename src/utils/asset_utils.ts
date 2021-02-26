import { BigNumber } from "ethers";
import {
  AccountEntity,
  AssetEntity,
  AssetHistoryEntity,
  CollectionEntity,
  GameEntity,
  ZeroXOrderEntity,
} from "../entities";
import { IAsset } from "../types";
import { accountUtils } from "./account_utils";
import { assetHistoryUtils } from "./asset_history_utils";
import { collectionUtils } from "./collection_utils";
import { gameUtils } from "./game_utils";
import { zeroXOrderUtils } from "./zero_x_order_utils";

export const assetUtils = {
  deserialize: (assetEntity: Required<AssetEntity>): IAsset => {
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
        ? accountUtils.deserialize(
            assetEntity.currentOwner as Required<AccountEntity>
          )
        : undefined,
      history: assetEntity.history
        ? assetEntity.history.map((historyEntity) =>
            assetHistoryUtils.deserialize(
              historyEntity as Required<AssetHistoryEntity>
            )
          )
        : undefined,
      collection: assetEntity.collection
        ? collectionUtils.deserialize(
            assetEntity.collection as Required<CollectionEntity>
          )
        : undefined,
      game: assetEntity.game
        ? gameUtils.deserialize(assetEntity.game as Required<GameEntity>)
        : undefined,
      orders: assetEntity.orders
        ? assetEntity.orders.map((order) =>
            zeroXOrderUtils.deserialize(order as Required<ZeroXOrderEntity>)
          )
        : undefined,
    };
    return asset;
  },

  serialize: (asset: IAsset): AssetEntity => {
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
        ? accountUtils.serialize(asset.currentOwner)
        : undefined,
      history: asset.history
        ? asset.history.map(assetHistoryUtils.serialize)
        : undefined,
      collection: asset.collection
        ? collectionUtils.serialize(asset.collection)
        : undefined,
      game: asset.game ? gameUtils.serialize(asset.game) : undefined,
      orders: asset.orders
        ? asset.orders.map(zeroXOrderUtils.serialize)
        : undefined,
    });
    return assetEntity;
  },
};
