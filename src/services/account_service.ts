import { PaginatedCollection } from "@0x/connect";
import * as _ from "lodash";
import { Connection } from "typeorm";

import { AccountEntity } from "../entities";
import { IAccount } from "../types";
import { accountUtils } from "../utils/account_utils";
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
      const account = accountUtils.deserializeAccount(
        accountEntity as Required<AccountEntity>
      );

      return account;
    }
    const account = await this.addAccount({
      id,
      address: id,
      assetCount: 0,
      createTimeStamp: timestamp,
      assets: [],
    });
    return account;
  }

  public async addAccount(account: IAccount): Promise<IAccount> {
    const records = await this._addAccountsAsync([account]);
    return records[0];
  }

  public async getAccount(id: string): Promise<IAccount> {
    const accountEntity = (await this._connection.manager.findOne(
      AccountEntity,
      id
    )) as Required<AccountEntity>;

    const account = accountUtils.deserializeAccount(accountEntity);

    return account;
  }

  public async listAccounts(
    page: number,
    perPage: number
  ): Promise<PaginatedCollection<IAccount>> {
    const accountEntities = (await this._connection.manager.find(
      AccountEntity
    )) as Required<AccountEntity>[];
    const accountItems = accountEntities.map(accountUtils.deserializeAccount);
    const paginatedAccounts = paginationUtils.paginate(
      accountItems,
      page,
      perPage
    );
    return paginatedAccounts;
  }

  private async _addAccountsAsync(_accounts: IAccount[]): Promise<IAccount[]> {
    const records = await this._connection
      .getRepository(AccountEntity)
      .save(_accounts.map(accountUtils.serializeAccount));
    return (records as Required<AccountEntity>[]).map(
      accountUtils.deserializeAccount
    );
    return [];
  }
}
