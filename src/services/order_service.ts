import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { ZeroXOrderEntity } from "../entities";
import { IZeroXOrder } from "../types";
import { paginationUtils } from "../utils/pagination_utils";
import { zeroXOrderUtils } from "../utils/zero_x_order_utils";

export class OrderService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async add(order: IZeroXOrder): Promise<IZeroXOrder> {
    const records = await this._addRecordsAsnyc([order]);
    return records[0];
  }

  public async get(id: string): Promise<IZeroXOrder | null> {
    const orderEntity = (await this._connection.manager.findOne(
      ZeroXOrderEntity,
      id
    )) as Required<ZeroXOrderEntity>;

    if (!orderEntity) {
      return null;
    }

    const order = zeroXOrderUtils.deserialize(orderEntity);

    return order;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IZeroXOrder>> {
    const orderEntities = (await this._connection.manager.find(
      ZeroXOrderEntity
    )) as Required<ZeroXOrderEntity>[];
    const orderItems = orderEntities.map(zeroXOrderUtils.deserialize);
    const paginatedOrders = paginationUtils.paginate(orderItems, page, perPage);
    return paginatedOrders;
  }

  public async update(order: IZeroXOrder): Promise<IZeroXOrder> {
    const records = (await this._connection
      .getRepository(ZeroXOrderEntity)
      .save(
        [order].map(zeroXOrderUtils.serialize)
      )) as Required<ZeroXOrderEntity>[];
    return zeroXOrderUtils.deserialize(records[0]);
  }

  private async _addRecordsAsnyc(
    _orders: IZeroXOrder[]
  ): Promise<IZeroXOrder[]> {
    const records = await this._connection
      .getRepository(ZeroXOrderEntity)
      .save(_orders.map(zeroXOrderUtils.serialize));
    return (records as Required<ZeroXOrderEntity>[]).map(
      zeroXOrderUtils.deserialize
    );
  }
}
