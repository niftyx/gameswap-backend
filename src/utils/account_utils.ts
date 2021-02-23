import { BigNumber } from "ethers";
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
      assetCount: BigNumber.from(accountEntity.assetCount),
      createTimeStamp: accountEntity.createTimeStamp,
      assets: accountEntity.assets
        ? accountEntity.assets.map((assetEntity) =>
            assetUtils.deserializeAsset(assetEntity as Required<AssetEntity>)
          )
        : undefined,
    };
    return account;
  },

  serializeAccount: (account: IAccount): CollectionHistoryEntity => {
    const accountEntity = new AccountEntity({
      id: account.id,
      address: account.address,
      assetCount: account.assetCount.toString(),
      createTimeStamp: account.createTimeStamp,
      assets: account.assets
        ? account.assets.map(assetUtils.serializeAsset)
        : undefined,
    });
    return accountEntity;
  },
};
