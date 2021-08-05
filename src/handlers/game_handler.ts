import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { GameService } from "../services/game_service";
import { v4 as uuidv4 } from "uuid";
import * as isValidUUID from "uuid-validate";
import { CommonService } from "../services/common_service";
import { UserService } from "../services/user_service";
import { isAddress } from "ethers/lib/utils";
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
    const {
      input: { payload: gameData },
      session_variables,
    } = req.body;
    const ownerId = String(session_variables["x-hasura-user-id"]).toLowerCase();

    if (!ownerId || !isAddress(ownerId)) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "Invalid Owner Address" });
      return;
    }

    const customUrlValid = await this.commonService.checkCustomUrlUsable(
      gameData.customUrl.toLowerCase()
    );
    if (!customUrlValid) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "Custom url invalid" });
      return;
    }

    const gameId = uuidv4();

    await this.userService.getOrCreate(ownerId, Math.floor(Date.now() / 1000));

    const game = await this.gameService.add({
      id: gameId,
      name: gameData.name,
      version: gameData.version,
      image_url: gameData.imageUrl,
      custom_url: gameData.customUrl.toLowerCase(),
      header_image_url: gameData.headerImageUrl,
      category_id: gameData.categoryId,
      description: gameData.description,
      platform: gameData.platform,
      is_verified: false,
      is_premium: false,
      is_featured: false,
      create_time_stamp: Math.floor(Date.now() / 1000),
      update_time_stamp: Math.floor(Date.now() / 1000),
      owner_id: ownerId,
    });

    res.status(HttpStatus.OK).json(game);
  }

  public async update(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const {
      input: { id, payload: gameData },
      session_variables,
    } = req.body;
    const ownerId = String(session_variables["x-hasura-user-id"]).toLowerCase();

    if (!isValidUUID(id)) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }

    let game = await this.gameService.get(id);

    if (ownerId !== game.owner_id) {
      res.status(HttpStatus.BAD_REQUEST).send();
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

    res.status(HttpStatus.OK).json(game);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Game Handler");
  }
}
