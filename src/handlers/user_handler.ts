import { CommonService } from "../services/common_service";
import { isAddress } from "ethers/lib/utils";
import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { UserService } from "../services/user_service";
import { utils } from "ethers";

export class UserHandler {
  private readonly userService: UserService;
  private readonly commonService: CommonService;
  constructor(userService: UserService, commonService: CommonService) {
    this.userService = userService;
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
    const userId = address.toLowerCase();
    if (!isAddress(userId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const msgHash = utils.hashMessage(restInfo.name);
    const msgHashBytes = utils.arrayify(msgHash);
    const owner = utils.recoverAddress(msgHashBytes, signedMessage);

    if (owner.toLowerCase() !== userId) {
      res.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    let user = await this.userService.getOrCreate(
      userId,
      Math.floor(Date.now() / 1000)
    );

    const newCustomUrl = restInfo.customUrl.toLowerCase();

    const customUrlValid = await this.commonService.checkCustomUrlUsable(
      newCustomUrl
    );
    if (!customUrlValid && user.customUrl !== newCustomUrl) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }

    user.name = restInfo.name;
    user.imageUrl = restInfo.imageUrl;
    user.customUrl = restInfo.customUrl.toLowerCase();
    user.bio = restInfo.bio;
    user.twitterUsername = restInfo.twitterUsername;
    user.twitchUsername = restInfo.twitchUsername;
    user.facebookUsername = restInfo.facebookUsername;
    user.youtubeUsername = restInfo.youtubeUsername;
    user.instagramUsername = restInfo.instagramUsername;
    user.tiktokUsername = restInfo.tiktokUsername;
    user.personalSite = restInfo.personalSite;
    user.headerImageUrl = restInfo.headerImageUrl;

    user = await this.userService.update(user);

    res.status(HttpStatus.OK).send(user);
  }

  public async verifyTwitter(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const {
      params: { id: address },
      // body: { username: twitterUsername },
    } = req;

    const userId = address.toLowerCase();
    if (!isAddress(userId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const user = await this.userService.getOrCreate(
      userId,
      Math.floor(Date.now() / 1000)
    );

    // verify twitter

    res.status(HttpStatus.OK).send(user);
  }

  public async get(req: express.Request, res: express.Response): Promise<void> {
    const {
      params: { id: address },
    } = req;
    const userId = address.toLowerCase();
    if (!isAddress(userId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const user = await this.userService.getOrCreate(
      userId,
      Math.floor(Date.now() / 1000)
    );

    res.status(HttpStatus.OK).send(user);
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
    res.status(HttpStatus.OK).send("Root of User Handler");
  }
}
