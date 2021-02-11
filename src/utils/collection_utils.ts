import { CollectionEntity } from "../entities";
import { ICollection } from "../types";

export const collectionUtils = {
  deserializeCollection: (
    collectionEntity: Required<CollectionEntity>
  ): ICollection => {
    const collection: ICollection = {
      id: collectionEntity.id,
      displayName: collectionEntity.displayName,
      description: collectionEntity.description,
      imageUrl: collectionEntity.imageUrl,
      shortUrl: collectionEntity.shortUrl,
    };
    return collection;
  },
};
