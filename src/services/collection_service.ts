import * as _ from "lodash";
import {
  deleteAllCollections,
  insertCollections,
  selectCollectionByCollectionId,
  selectCollectionsForSync,
  updateCollectionByCollectionId,
} from "../shared/queries";
import { request } from "../shared/request";
import { ICollection } from "../types";
import { collectionUtils } from "../utils/collectionUtils";

export interface QueryCollectionData {
  collections: ICollection[];
}

export interface InsertCollectionData {
  insert_collections: {
    returning: ICollection[];
  };
}

export interface UpdateCollectionData {
  update_collections: {
    returning: ICollection[];
  };
}

export class CollectionService {
  public async add(collection: ICollection): Promise<ICollection> {
    const records = await this._addRecordsAsnyc([collection]);
    return records[0];
  }

  public async get(id: string): Promise<ICollection | null> {
    const response = await request<QueryCollectionData>(
      selectCollectionByCollectionId,
      { id }
    );
    if (!response.collections[0]) return null;
    return collectionUtils.toBNObj(response.collections[0]);
  }

  public async deleteAll() {
    await request(deleteAllCollections);
  }

  public async listForSync(
    offset: number,
    limit: number
  ): Promise<ICollection[]> {
    const response = await request<QueryCollectionData>(
      selectCollectionsForSync,
      { limit, offset }
    );
    return response.collections.map((collection) =>
      collectionUtils.toBNObj(collection)
    );
  }

  public async update(collection: ICollection): Promise<ICollection> {
    const response = await request<UpdateCollectionData>(
      updateCollectionByCollectionId,
      {
        id: collection.id,
        changes: { ...collectionUtils.toStrObj(collection) },
      }
    );
    return collectionUtils.toBNObj(response.update_collections.returning[0]);
  }

  private async _addRecordsAsnyc(
    collections: ICollection[]
  ): Promise<ICollection[]> {
    const response = await request<InsertCollectionData>(insertCollections, {
      collections_data: collections.map((collection) =>
        collectionUtils.toStrObj(collection)
      ),
    });
    return response.insert_collections.returning.map((collection) =>
      collectionUtils.toBNObj(collection)
    );
  }
}
