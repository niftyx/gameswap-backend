import { AssetEntity, ZeroXOrderEntity } from "../entities";
import { IZeroXOrder, ZeroXOrderType } from "../types";
import { assetUtils } from "./asset_utils";

export const zeroXOrderUtils = {
  deserializeOrder: (orderEntity: Required<ZeroXOrderEntity>): IZeroXOrder => {
    const order: IZeroXOrder = {
      hash: orderEntity.hash,
      senderAddress: orderEntity.senderAddress,
      makerAddress: orderEntity.makerAddress,
      takerAddress: orderEntity.takerAddress,
      makerAssetData: orderEntity.makerAssetData,
      takerAssetData: orderEntity.takerAssetData,
      exchangeAddress: orderEntity.exchangeAddress,
      feeRecipientAddress: orderEntity.feeRecipientAddress,
      expirationTimeSeconds: orderEntity.expirationTimeSeconds,
      makerFee: orderEntity.makerFee,
      takerFee: orderEntity.takerFee,
      makerAssetAmount: orderEntity.makerAssetAmount,
      takerAssetAmount: orderEntity.takerAssetAmount,
      salt: orderEntity.salt,
      signature: orderEntity.signature,
      remainingFillableTakerAssetAmount:
        orderEntity.remainingFillableTakerAssetAmount,
      makerFeeAssetData: orderEntity.makerFeeAssetData,
      takerFeeAssetData: orderEntity.takerFeeAssetData,
      status: orderEntity.status as ZeroXOrderType,
      createdAt: orderEntity.createdAt,
      asset: orderEntity.asset
        ? assetUtils.deserializeAsset(
            orderEntity.asset as Required<AssetEntity>
          )
        : undefined,
    };
    return order;
  },

  serializeOrder: (order: IZeroXOrder): ZeroXOrderEntity => {
    const orderEntity = new ZeroXOrderEntity({
      hash: order.hash,
      senderAddress: order.senderAddress,
      makerAddress: order.makerAddress,
      takerAddress: order.takerAddress,
      makerAssetData: order.makerAssetData,
      takerAssetData: order.takerAssetData,
      exchangeAddress: order.exchangeAddress,
      feeRecipientAddress: order.feeRecipientAddress,
      expirationTimeSeconds: order.expirationTimeSeconds,
      makerFee: order.makerFee,
      takerFee: order.takerFee,
      makerAssetAmount: order.makerAssetAmount,
      takerAssetAmount: order.takerAssetAmount,
      salt: order.salt,
      signature: order.signature,
      remainingFillableTakerAssetAmount:
        order.remainingFillableTakerAssetAmount,
      makerFeeAssetData: order.makerFeeAssetData,
      takerFeeAssetData: order.takerFeeAssetData,
      status: order.status,
      createdAt: order.createdAt,
      asset: order.asset ? assetUtils.serializeAsset(order.asset) : undefined,
    });
    return orderEntity;
  },
};
