import { PaginatedCollection } from "@0x/connect";
import { BigNumber } from "ethers";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { AssetEntity } from "../entities";
import { IAsset } from "../types";
import { assetUtils } from "../utils/asset_utils";
import { paginationUtils } from "../utils/pagination_utils";

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
      relations: ["collection"],
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
    perPage: number
  ): Promise<PaginatedCollection<IAsset>> {
    const assetEntities = (await this._connection.manager.find(
      AssetEntity
    )) as Required<AssetEntity>[];
    const assetItems = assetEntities.map(assetUtils.deserialize);
    const paginatedAssets = paginationUtils.paginate(assetItems, page, perPage);
    return paginatedAssets;
  }

  public async listByAddress(
    owner: string,
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAsset>> {
    const assetEntities = (await this._connection
      .getRepository(AssetEntity)
      .find({
        relations: ["currentOwner", "collection"],
        where: { currentOwner: { id: owner } },
      })) as Required<AssetEntity>[];
    const assetItems = assetEntities.map(assetUtils.deserialize);
    const paginatedAssets = paginationUtils.paginate(assetItems, page, perPage);
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
}
