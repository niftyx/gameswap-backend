import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { AccountEntity } from "../entities";
import { IAccount } from "../types";
import { accountUtils } from "../utils/account_utils";
import { ZERO_NUMBER } from "../utils/number";
import { paginationUtils } from "../utils/pagination_utils";

export class AccountService {
  private readonly _connection: Connection;
  constructor(connection: Connection) {
    this._connection = connection;
  }

  public async getOrCreateAccount(
    id: string,
    timestamp: number
  ): Promise<IAccount> {
    const accountEntity = await this._connection.manager.findOne(
      AccountEntity,
      id
    );
    if (accountEntity) {
      const account = accountUtils.deserialize(
        accountEntity as Required<AccountEntity>
      );

      return account;
    }
    const account = await this.add({
      id,
      address: id,
      assetCount: ZERO_NUMBER,
      createTimeStamp: timestamp,
      assets: [],
    });
    return account;
  }

  public async add(account: IAccount): Promise<IAccount> {
    const records = await this._addRecordsAsync([account]);
    return records[0];
  }

  public async update(account: IAccount): Promise<IAccount> {
    const records = (await this._connection
      .getRepository(AccountEntity)
      .save(
        [account].map(accountUtils.serialize)
      )) as Required<AccountEntity>[];
    return accountUtils.deserialize(records[0]);
  }

  public async get(id: string): Promise<IAccount | null> {
    const accountEntity = (await this._connection.manager.findOne(
      AccountEntity,
      id
    )) as Required<AccountEntity>;

    if (!accountEntity) {
      return null;
    }

    const account = accountUtils.deserialize(accountEntity);

    return account;
  }

  public async list(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAccount>> {
    const accountEntities = (await this._connection.manager.find(
      AccountEntity
    )) as Required<AccountEntity>[];
    const accountItems = accountEntities.map(accountUtils.deserialize);
    const paginatedAccounts = paginationUtils.paginate(
      accountItems,
      page,
      perPage
    );
    return paginatedAccounts;
  }

  private async _addRecordsAsync(_accounts: IAccount[]): Promise<IAccount[]> {
    const records = await this._connection
      .getRepository(AccountEntity)
      .save(_accounts.map(accountUtils.serialize));
    return (records as Required<AccountEntity>[]).map(accountUtils.deserialize);
  }
}
