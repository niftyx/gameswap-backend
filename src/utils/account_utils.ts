import { BigNumber } from "ethers";
import {
  AccountEntity,
  AssetEntity,
  CollectionHistoryEntity,
} from "../entities";
import { IAccount } from "../types";
import { assetUtils } from "./asset_utils";

export const accountUtils = {
  deserialize: (accountEntity: Required<AccountEntity>): IAccount => {
    const account: IAccount = {
      id: accountEntity.id,
      address: accountEntity.address,
      name: accountEntity.name,
      customUrl: accountEntity.customUrl,
      bio: accountEntity.bio,
      imageUrl: accountEntity.imageUrl,
      headerImageUrl: accountEntity.headerImageUrl,
      twitterUsername: accountEntity.twitterUsername,
      twitterVerified: accountEntity.twitterVerified,
      twitchUsername: accountEntity.twitchUsername,
      facebookUsername: accountEntity.facebookUsername,
      youtubeUsername: accountEntity.youtubeUsername,
      instagramUsername: accountEntity.instagramUsername,
      tiktokUsername: accountEntity.tiktokUsername,
      personalSite: accountEntity.personalSite,
      assetCount: BigNumber.from(accountEntity.assetCount),
      createTimeStamp: accountEntity.createTimeStamp,
      assets: accountEntity.assets
        ? accountEntity.assets.map((assetEntity) =>
            assetUtils.deserialize(assetEntity as Required<AssetEntity>)
          )
        : undefined,
      createdAssets: accountEntity.createdAssets
        ? accountEntity.createdAssets.map((assetEntity) =>
            assetUtils.deserialize(assetEntity as Required<AssetEntity>)
          )
        : undefined,
    };
    return account;
  },

  serialize: (account: IAccount): CollectionHistoryEntity => {
    const accountEntity = new AccountEntity({
      id: account.id,
      address: account.address,
      name: account.name,
      customUrl: account.customUrl,
      bio: account.bio,
      imageUrl: account.imageUrl,
      headerImageUrl: account.headerImageUrl,
      twitterUsername: account.twitterUsername,
      twitterVerified: account.twitterVerified,
      twitchUsername: account.twitchUsername,
      facebookUsername: account.facebookUsername,
      youtubeUsername: account.youtubeUsername,
      instagramUsername: account.instagramUsername,
      tiktokUsername: account.tiktokUsername,
      personalSite: account.personalSite,
      assetCount: account.assetCount.toString(),
      createTimeStamp: account.createTimeStamp,
      assets: account.assets
        ? account.assets.map(assetUtils.serialize)
        : undefined,
      createdAssets: account.createdAssets
        ? account.createdAssets.map(assetUtils.serialize)
        : undefined,
    });
    return accountEntity;
  },
};
