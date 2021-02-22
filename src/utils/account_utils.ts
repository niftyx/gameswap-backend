import {
  AccountEntity,
  AssetEntity,
  CollectionHistoryEntity,
} from "../entities";
import { IAccount } from "../types";
import { assetUtils } from "./asset_utils";

export const accountUtils = {
  deserializeAccount: (accountEntity: Required<AccountEntity>): IAccount => {
    const account: IAccount = {
      id: accountEntity.id,
      address: accountEntity.address,
      assetCount: accountEntity.assetCount,
      createTimeStamp: accountEntity.createTimeStamp,
      assets: accountEntity.assets.map((assetEntity) =>
        assetUtils.deserializeAsset(assetEntity as Required<AssetEntity>)
      ),
    };
    return account;
  },

  serializeAccount: (account: IAccount): CollectionHistoryEntity => {
    const accountEntity = new AccountEntity({
      id: account.id,
      address: account.address,
      assetCount: account.assetCount,
      createTimeStamp: account.createTimeStamp,
      assets: account.assets.map(assetUtils.serializeAsset),
    });
    return accountEntity;
  },
};
