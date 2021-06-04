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
    if (!customUrlValid && user.custom_url !== newCustomUrl) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }

    user.name = restInfo.name;
    user.image_url = restInfo.imageUrl;
    user.custom_url = restInfo.customUrl.toLowerCase();
    user.bio = restInfo.bio;
    user.twitter_username = restInfo.twitterUsername;
    user.twitch_username = restInfo.twitchUsername;
    user.facebook_username = restInfo.facebookUsername;
    user.youtube_username = restInfo.youtubeUsername;
    user.instagram_username = restInfo.instagramUsername;
    user.tiktok_username = restInfo.tiktokUsername;
    user.personal_site = restInfo.personalSite;
    user.header_image_url = restInfo.headerImageUrl;

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
