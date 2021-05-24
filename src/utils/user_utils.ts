import {
  UserEntity,
  AssetEntity,
  CollectionHistoryEntity,
  GameEntity,
  CollectionEntity,
} from "../entities";
import { IUser } from "../types";
import { assetUtils } from "./asset_utils";
import { collectionUtils } from "./collection_utils";
import { gameUtils } from "./game_utils";

export const userUtils = {
  deserialize: (userEntity: Required<UserEntity>): IUser => {
    const user: IUser = {
      id: userEntity.id,
      address: userEntity.address,
      name: userEntity.name,
      customUrl: userEntity.customUrl,
      bio: userEntity.bio,
      imageUrl: userEntity.imageUrl,
      headerImageUrl: userEntity.headerImageUrl,
      twitterUsername: userEntity.twitterUsername,
      twitterVerified: userEntity.twitterVerified,
      twitchUsername: userEntity.twitchUsername,
      facebookUsername: userEntity.facebookUsername,
      youtubeUsername: userEntity.youtubeUsername,
      instagramUsername: userEntity.instagramUsername,
      tiktokUsername: userEntity.tiktokUsername,
      personalSite: userEntity.personalSite,
      createTimestamp: userEntity.createTimestamp,
      updateTimestamp: userEntity.updateTimestamp,
      assets: userEntity.assets
        ? userEntity.assets.map((assetEntity) =>
            assetUtils.deserialize(assetEntity as Required<AssetEntity>)
          )
        : undefined,
      games: userEntity.games
        ? userEntity.games.map((gameEntity) =>
            gameUtils.deserialize(gameEntity as Required<GameEntity>)
          )
        : undefined,
      collections: userEntity.collections
        ? userEntity.collections.map((collectionEntity) =>
            collectionUtils.deserialize(
              collectionEntity as Required<CollectionEntity>
            )
          )
        : undefined,
      createdAssets: userEntity.createdAssets
        ? userEntity.createdAssets.map((assetEntity) =>
            assetUtils.deserialize(assetEntity as Required<AssetEntity>)
          )
        : undefined,
      followingGames: userEntity.followingGames
        ? userEntity.followingGames.map((gameEntity) =>
            gameUtils.deserialize(gameEntity as Required<GameEntity>)
          )
        : undefined,
      followings: userEntity.followings
        ? userEntity.followings.map((userEntity) =>
            userUtils.deserialize(userEntity as Required<UserEntity>)
          )
        : undefined,
      followers: userEntity.followers
        ? userEntity.followers.map((userEntity) =>
            userUtils.deserialize(userEntity as Required<UserEntity>)
          )
        : undefined,
    };
    return user;
  },

  serialize: (user: IUser): CollectionHistoryEntity => {
    const userEntity = new UserEntity({
      id: user.id,
      address: user.address,
      name: user.name,
      customUrl: user.customUrl,
      bio: user.bio,
      imageUrl: user.imageUrl,
      headerImageUrl: user.headerImageUrl,
      twitterUsername: user.twitterUsername,
      twitterVerified: user.twitterVerified,
      twitchUsername: user.twitchUsername,
      facebookUsername: user.facebookUsername,
      youtubeUsername: user.youtubeUsername,
      instagramUsername: user.instagramUsername,
      tiktokUsername: user.tiktokUsername,
      personalSite: user.personalSite,
      createTimestamp: user.createTimestamp,
      updateTimestamp: user.updateTimestamp,
      assets: user.assets ? user.assets.map(assetUtils.serialize) : undefined,
      games: user.games ? user.games.map(gameUtils.serialize) : undefined,
      collections: user.collections
        ? user.collections.map(collectionUtils.serialize)
        : undefined,
      createdAssets: user.createdAssets
        ? user.createdAssets.map(assetUtils.serialize)
        : undefined,
      followingGames: user.followingGames
        ? user.followingGames.map(gameUtils.serialize)
        : undefined,
      followings: user.followings
        ? user.followings.map(userUtils.serialize)
        : undefined,
      followers: user.followers
        ? user.followers.map(userUtils.serialize)
        : undefined,
    });
    return userEntity;
  },
};
