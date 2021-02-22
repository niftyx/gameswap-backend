import { CollectionEntity, CollectionHistoryEntity } from "../entities";
import { ICollectionHistory } from "../types";
import { collectionUtils } from "./collection_utils";

export const collectionHistoryUtils = {
  deserializeCollectionHistory: (
    collectionHistoryEntity: Required<CollectionHistoryEntity>
  ): ICollectionHistory => {
    const collectionHistory: ICollectionHistory = {
      id: collectionHistoryEntity.id,
      owner: collectionHistoryEntity.owner,
      timestamp: collectionHistoryEntity.timestamp,
      txHash: collectionHistoryEntity.txHash,
      collection: collectionHistoryEntity.collection
        ? collectionUtils.deserializeCollection(
            collectionHistoryEntity.collection as Required<CollectionEntity>
          )
        : undefined,
    };
    return collectionHistory;
  },

  serializeCollectionHistory: (
    collectionHistory: ICollectionHistory
  ): CollectionHistoryEntity => {
    const collectionHistoryEntity = new CollectionHistoryEntity({
      id: collectionHistory.id,
      owner: collectionHistory.owner,
      timestamp: collectionHistory.timestamp,
      txHash: collectionHistory.txHash,
      collection: collectionHistory.collection
        ? collectionUtils.serializeCollection(collectionHistory.collection)
        : undefined,
    });
    return collectionHistoryEntity;
  },
};
