import { CommonService } from "./../services/common_service";
import { isAddress } from "ethers/lib/utils";
import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { AccountService } from "../services/account_service";
import { utils } from "ethers";

export class AccountHandler {
  private readonly accountService: AccountService;
  private readonly commonService: CommonService;
  constructor(accountService: AccountService, commonService: CommonService) {
    this.accountService = accountService;
    this.commonService = commonService;
  }

  public async update(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
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

    const customUrlValid = await this.commonService.checkCustomUrlUsable(
      restInfo.customUrl
    );
    if (!customUrlValid) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }

    let account = await this.accountService.getOrCreateAccount(
      accountId,
      Math.floor(Date.now() / 1000)
    );
    account.name = restInfo.name;
    account.imageUrl = restInfo.imageUrl;
    account.customUrl = restInfo.customUrl;
    account.bio = restInfo.bio;
    account.twitterUsername = restInfo.twitterUsername;
    account.twitchUsername = restInfo.twitchUsername;
    account.facebookUsername = restInfo.facebookUsername;
    account.youtubeUsername = restInfo.youtubeUsername;
    account.instagramUsername = restInfo.instagramUsername;
    account.tiktokUsername = restInfo.tiktokUsername;
    account.personalSite = restInfo.personalSite;
    account.headerImageUrl = restInfo.headerImageUrl;

    account = await this.accountService.update(account);

    res.status(HttpStatus.OK).send(account);
  }

  public async verifyTwitter(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const {
      params: { id: address },
      // body: { username: twitterUsername },
    } = req;

    const accountId = address.toLowerCase();
    if (!isAddress(accountId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const account = await this.accountService.getOrCreateAccount(
      accountId,
      Math.floor(Date.now() / 1000)
    );

    // verify twitter

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
      Math.floor(Date.now() / 1000)
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
    res.status(HttpStatus.OK).send("Root of Account Handler");
  }
}
