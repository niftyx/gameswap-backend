import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { GameService } from "../services/game_service";
import { v4 as uuidv4 } from "uuid";
import * as isValidUUID from "uuid-validate";
import { utils } from "ethers";
import { AssetService } from "../services/asset_service";
export class GameHandler {
  private readonly gameService: GameService;
  private readonly assetService: AssetService;
  constructor(gameService: GameService, assetService: AssetService) {
    this.gameService = gameService;
    this.assetService = assetService;
  }
  public async create(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { message, ...gameData } = req.body;

    const msgHash = utils.hashMessage(gameData.name);
    const msgHashBytes = utils.arrayify(msgHash);

    const owner = utils.recoverAddress(msgHashBytes, message);
    const gameId = uuidv4();

    const game = await this.gameService.add({
      ...gameData,
      id: gameId,
      owner,
      createdAt: Math.floor(Date.now() / 1000),
    });

    res.status(HttpStatus.OK).send(game);
  }

  public async get(req: express.Request, res: express.Response): Promise<void> {
    const id = req.params.id;
    if (!isValidUUID(id)) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const game = await this.gameService.get(id);
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

    if (owner.toLowerCase() !== game?.owner?.toLowerCase()) {
      res.status(HttpStatus.UNAUTHORIZED).send();
      return;
    }

    game.name = gameData.name;
    game.version = gameData.version;
    game.description = gameData.description;
    game.categoryId = gameData.categoryId;
    game.imageUrl = gameData.imageUrl;
    game.headerImageUrl = gameData.headerImageUrl;
    game.platform = gameData.platform;

    game = await this.gameService.update(game);

    res.status(HttpStatus.OK).send(game);
  }

  public async list(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 100);
    const result = await this.gameService.list(page, perPage);
    res.status(HttpStatus.OK).send(result);
  }

  public async listAssetsRelated(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const id = req.params.id;
    if (!isValidUUID(id)) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 100);
    const result = await this.assetService.listAssetsRelatedToGame(
      page,
      perPage,
      id
    );
    res.status(HttpStatus.OK).send(result);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Game Handler");
  }
}
