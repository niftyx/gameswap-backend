import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { GameService } from "../services/game_service";
import { v4 as uuidv4 } from "uuid";
import * as isValidUUID from "uuid-validate";
import { utils } from "ethers";
import { CommonService } from "../services/common_service";
import { UserService } from "../services/user_service";
export class GameHandler {
  private readonly gameService: GameService;
  private readonly commonService: CommonService;
  private readonly userService: UserService;

  constructor(
    gameService: GameService,
    commonService: CommonService,
    userService: UserService
  ) {
    this.gameService = gameService;
    this.commonService = commonService;
    this.userService = userService;
  }
  public async create(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { message, ...gameData } = req.body;

    const customUrlValid = await this.commonService.checkCustomUrlUsable(
      gameData.customUrl.toLowerCase()
    );
    if (!customUrlValid) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }

    const msgHash = utils.hashMessage(gameData.name);
    const msgHashBytes = utils.arrayify(msgHash);

    const owner = utils.recoverAddress(msgHashBytes, message);
    const gameId = uuidv4();

    const ownerObj = await this.userService.getOrCreate(
      owner.toLowerCase(),
      Math.floor(Date.now() / 1000)
    );

    const game = await this.gameService.add({
      ...gameData,
      customUrl: gameData.customUrl.toLowerCase(),
      id: gameId,
      owner: ownerObj,
      createTimestamp: Math.floor(Date.now() / 1000),
      updateTimestamp: Math.floor(Date.now() / 1000),
      isVerified: false,
      isPremium: false,
      isFeatured: false,
    });

    res.status(HttpStatus.OK).send(game);
  }

  public async update(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const id = req.params.id;
    if (!isValidUUID(id)) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const { message, ...gameData } = req.body;

    const msgHash = utils.hashMessage(gameData.name);
    const msgHashBytes = utils.arrayify(msgHash);

    const owner = utils.recoverAddress(msgHashBytes, message);

    let game = await this.gameService.get(id);

    if (owner.toLowerCase() !== game?.owner_id) {
      res.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    const newCustomUrl = gameData.customUrl.toLowerCase();

    const customUrlValid = await this.commonService.checkCustomUrlUsable(
      newCustomUrl
    );
    if (!customUrlValid && newCustomUrl !== game.custom_url) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }

    game.name = gameData.name;
    game.version = gameData.version;
    game.description = gameData.description;
    game.category_id = gameData.categoryId;
    game.image_url = gameData.imageUrl;
    game.header_image_url = gameData.headerImageUrl;
    game.platform = gameData.platform;
    game.custom_url = newCustomUrl;
    game.update_time_stamp = Math.floor(Date.now() / 1000);
    game = await this.gameService.update(game);

    res.status(HttpStatus.OK).send(game);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Game Handler");
  }
}
