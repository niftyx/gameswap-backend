import {
  CollectionEntity,
  CollectionHistoryEntity,
  UserEntity,
} from "../entities";
import { ICollectionHistory } from "../types";
import { collectionUtils } from "./collection_utils";
import { userUtils } from "./user_utils";

export const collectionHistoryUtils = {
  deserialize: (
    collectionHistoryEntity: Required<CollectionHistoryEntity>
  ): ICollectionHistory => {
    const collectionHistory: ICollectionHistory = {
      id: collectionHistoryEntity.id,
      owner: collectionHistoryEntity.owner
        ? userUtils.deserialize(
            collectionHistoryEntity.owner as Required<UserEntity>
          )
        : undefined,
      timestamp: collectionHistoryEntity.timestamp,
      txHash: collectionHistoryEntity.txHash,
      collection: collectionHistoryEntity.collection
        ? collectionUtils.deserialize(
            collectionHistoryEntity.collection as Required<CollectionEntity>
          )
        : undefined,
    };
    return collectionHistory;
  },

  serialize: (
    collectionHistory: ICollectionHistory
  ): CollectionHistoryEntity => {
    const collectionHistoryEntity = new CollectionHistoryEntity({
      id: collectionHistory.id,
      owner: collectionHistory.owner
        ? userUtils.serialize(collectionHistory.owner)
        : undefined,
      timestamp: collectionHistory.timestamp,
      txHash: collectionHistory.txHash,
      collection: collectionHistory.collection
        ? collectionUtils.serialize(collectionHistory.collection)
        : undefined,
    });
    return collectionHistoryEntity;
  },
};
