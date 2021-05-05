import { AssetHistoryEntity } from "./../entities/AssetHistoryEntity";
import { PaginatedCollection } from "@0x/connect";
import { BigNumber } from "ethers";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { AssetEntity } from "../entities";
import { IAsset, IAssetHistory } from "../types";
import { assetUtils } from "../utils/asset_utils";
import { paginationUtils } from "../utils/pagination_utils";
import { assetHistoryUtils } from "../utils/asset_history_utils";

export class AssetService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async add(asset: IAsset): Promise<IAsset> {
    const records = await this._addRecordsAsync([asset]);
    return records[0];
  }

  public async get(id: string): Promise<IAsset | null> {
    const assetEntity = (await this._connection.manager.findOne(
      AssetEntity,
      id
    )) as Required<AssetEntity>;

    if (!assetEntity) {
      return null;
    }
    const asset = assetUtils.deserialize(assetEntity);

    return asset;
  }

  public async getWithDetails(id: string): Promise<IAsset | null> {
    const assetEntity = (await this._connection
      .getRepository(AssetEntity)
      .findOne({
        where: { id },
        relations: ["currentOwner", "collection", "creator"],
      })) as Required<AssetEntity>;

    if (!assetEntity) {
      return null;
    }
    const asset = assetUtils.deserialize(assetEntity);

    return asset;
  }

  public async getForContentData(
    contentId: string,
    owner: string
  ): Promise<IAsset | null> {
    const assetEntity = (await this._connection
      .getRepository(AssetEntity)
      .findOne({
        where: { contentId, currentOwner: { id: owner } },
        relations: ["currentOwner", "collection"],
      })) as Required<AssetEntity>;

    if (!assetEntity) {
      return null;
    }
    const asset = assetUtils.deserialize(assetEntity);

    return asset;
  }

  public async getByTokenIdAndCollectionId(
    tokenId: BigNumber,
    collectionId: string
  ): Promise<IAsset | null> {
    const repository = this._connection.getRepository(AssetEntity);
    const assetEntity = (await repository.findOne({
      relations: ["collection", "currentOwner"],
      where: { collection: { id: collectionId }, assetId: tokenId.toString() },
    })) as Required<AssetEntity>;

    if (!assetEntity) {
      return null;
    }
    const asset = assetUtils.deserialize(assetEntity);

    return asset;
  }

  public async getFullDetailsByTokenIdAndCollectionId(
    _tokenId: BigNumber,
    collectionId: string
  ): Promise<IAsset | null> {
    const assetEntity = (await this._connection
      .getRepository(AssetEntity)
      .findOne({
        relations: ["currentOwner", "collection"],
        where: {
          collection: { id: collectionId },
          assetId: _tokenId.toString(),
        },
      })) as Required<AssetEntity>;
    if (!assetEntity) {
      return null;
    }

    const asset = assetUtils.deserialize(assetEntity);

    return asset;
  }

  public async list(
    page: number,
    perPage: number,
    query?: any
  ): Promise<PaginatedCollection<IAsset>> {
    const orderBy = query && query.orderBy ? query.orderBy : "createTimeStamp";
    const orderDir = query && query.orderDir ? query.orderDir : "ASC";
    const { collectionId, ownerId, creatorId, ...restQuery } = query || {};

    const relations = ["currentOwner", "collection"];
    let whereSubClause = {};
    if (collectionId) {
      whereSubClause = {
        ...whereSubClause,
        collection: { id: String(collectionId).toLowerCase() },
      };
    }
    if (ownerId) {
      whereSubClause = {
        ...whereSubClause,
        currentOwner: { id: String(ownerId).toLowerCase() },
      };
    }
    if (creatorId) {
      relations.push("creator");
      whereSubClause = {
        ...whereSubClause,
        creator: { id: String(creatorId).toLowerCase() },
      };
    }

    const [entityCount, entities] = await Promise.all([
      this._connection.manager.count(AssetEntity),
      this._connection.manager.find(AssetEntity, {
        relations,
        ...(Object.keys(whereSubClause).length
          ? { where: { ...restQuery, ...whereSubClause } }
          : restQuery
          ? { where: query }
          : {}),
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          [orderBy]: orderDir,
        },
      }),
    ]);
    const assetItems = (entities as Required<AssetEntity>[]).map(
      assetUtils.deserialize
    );
    const paginatedAssets = paginationUtils.paginateSerialize(
      assetItems,
      entityCount,
      page,
      perPage
    );
    return paginatedAssets;
  }

  public async getHistory(
    page: number,
    perPage: number,
    assetId: string
  ): Promise<PaginatedCollection<IAssetHistory>> {
    const [entityCount, entities] = await Promise.all([
      this._connection.getRepository(AssetHistoryEntity).count({
        where: { asset: { id: assetId } },
      }),
      this._connection.getRepository(AssetHistoryEntity).find({
        where: { asset: { id: assetId } },
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: { timestamp: "DESC" },
      }),
    ]);

    const assetHistoryItems = (entities as Required<AssetHistoryEntity>[]).map(
      assetHistoryUtils.deserialize
    );
    const paginatedHistoryAssets = paginationUtils.paginateSerialize(
      assetHistoryItems,
      entityCount,
      page,
      perPage
    );
    return paginatedHistoryAssets;
  }

  public async listByOwner(
    owner: string,
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAsset>> {
    const [entityCount, entities] = await Promise.all([
      this._connection.getRepository(AssetEntity).count({
        relations: ["currentOwner"],
        where: { currentOwner: { id: owner } },
      }),
      this._connection.getRepository(AssetEntity).find({
        relations: ["currentOwner", "collection"],
        where: { currentOwner: { id: owner } },
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: { createTimeStamp: "DESC" },
      }),
    ]);
    const assetItems = (entities as Required<AssetEntity>[]).map(
      assetUtils.deserialize
    );
    const paginatedAssets = paginationUtils.paginateSerialize(
      assetItems,
      entityCount,
      page,
      perPage
    );
    return paginatedAssets;
  }

  public async listByCreator(
    owner: string,
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAsset>> {
    const [entityCount, entities] = await Promise.all([
      this._connection.getRepository(AssetEntity).count({
        relations: ["creator"],
        where: { creator: { id: owner } },
      }),
      this._connection.getRepository(AssetEntity).find({
        relations: ["currentOwner", "collection", "creator"],
        where: { creator: { id: owner } },
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: { createTimeStamp: "DESC" },
      }),
    ]);
    const assetItems = (entities as Required<AssetEntity>[]).map(
      assetUtils.deserialize
    );
    const paginatedAssets = paginationUtils.paginateSerialize(
      assetItems,
      entityCount,
      page,
      perPage
    );
    return paginatedAssets;
  }

  public async listByCollection(
    collectionId: string,
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAsset>> {
    const [entityCount, entities] = await Promise.all([
      this._connection.getRepository(AssetEntity).count({
        relations: ["collection"],
        where: { collection: { id: collectionId } },
      }),
      this._connection.getRepository(AssetEntity).find({
        relations: ["currentOwner", "collection", "creator"],
        where: { collection: { id: collectionId } },
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: { createTimeStamp: "DESC" },
      }),
    ]);
    const assetItems = (entities as Required<AssetEntity>[]).map(
      assetUtils.deserialize
    );
    const paginatedAssets = paginationUtils.paginateSerialize(
      assetItems,
      entityCount,
      page,
      perPage
    );
    return paginatedAssets;
  }

  public async update(asset: IAsset): Promise<IAsset> {
    const records = (await this._connection
      .getRepository(AssetEntity)
      .save([asset].map(assetUtils.serialize))) as Required<AssetEntity>[];
    return assetUtils.deserialize(records[0]);
  }

  private async _addRecordsAsync(_assets: IAsset[]): Promise<IAsset[]> {
    const records = await this._connection
      .getRepository(AssetEntity)
      .save(_assets.map(assetUtils.serialize));
    return (records as Required<AssetEntity>[]).map(assetUtils.deserialize);
  }

  public async listAssetsRelatedToGame(
    page: number,
    perPage: number,
    gameId: string
  ): Promise<PaginatedCollection<IAsset>> {
    const [entityCount, entities] = await Promise.all([
      this._connection.getRepository(AssetEntity).count({
        where: { gameId },
      }),
      this._connection.getRepository(AssetEntity).find({
        relations: ["currentOwner", "collection"],
        where: { gameId },
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: { createTimeStamp: "DESC" },
      }),
    ]);

    const assetItems = (entities as Required<AssetEntity>[]).map(
      assetUtils.deserialize
    );
    const paginatedAssets = paginationUtils.paginateSerialize(
      assetItems,
      entityCount,
      page,
      perPage
    );
    return paginatedAssets;
  }
}
