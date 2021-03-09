import { isAddress } from "ethers/lib/utils";
import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { AccountService } from "../services/account_service";
import { utils } from "ethers";
import { logger } from "../app";

export class AccountHandler {
  private readonly accountService: AccountService;
  constructor(accountService: AccountService) {
    this.accountService = accountService;
  }

  public async update(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    logger.info(req.body);
    const {
      body: { signedMessage, ...restInfo },
      params: { id: address },
    } = req;
    const accountId = address.toLowerCase();
    if (!isAddress(accountId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const msgHash = utils.hashMessage(restInfo.name);
    const msgHashBytes = utils.arrayify(msgHash);
    const owner = utils.recoverAddress(msgHashBytes, signedMessage);

    if (owner.toLowerCase() !== accountId) {
      res.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    let account = await this.accountService.getOrCreateAccount(
      accountId,
      Date.now()
    );
    account.name = restInfo.name;
    account.imageUrl = restInfo.imageUrl;
    account.customUrl = restInfo.customUrl;
    account.bio = restInfo.bio;
    account.twitterUsername = restInfo.twitterUsername;
    account.personalSite = restInfo.personalSite;

    account = await this.accountService.update(account);

    res.status(HttpStatus.OK).send(account);
  }

  public async get(req: express.Request, res: express.Response): Promise<void> {
    const {
      params: { id: address },
    } = req;
    const accountId = address.toLowerCase();
    if (!isAddress(accountId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const account = await this.accountService.getOrCreateAccount(
      accountId,
      Date.now()
    );

    res.status(HttpStatus.OK).send(account);
  }

  public async list(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    console.log(req.body);
    res.status(HttpStatus.OK).send();
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Collection Handler");
  }
}
