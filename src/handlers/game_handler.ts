import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { GameService } from "../services/game_service";
import { v4 as uuidv4 } from "uuid";
import * as isValidUUID from "uuid-validate";
import { utils } from "ethers";
export class GameHandler {
  private readonly _gameService: GameService;
  constructor(gameService: GameService) {
    this._gameService = gameService;
  }
  public async create(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { message, ...gameData } = req.body;

    const msgHash = utils.hashMessage(gameData.title);
    const msgHashBytes = utils.arrayify(msgHash);

    const owner = utils.recoverAddress(msgHashBytes, message);
    const gameId = uuidv4();

    const game = await this._gameService.add({
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
    const game = await this._gameService.get(id);
    res.status(HttpStatus.OK).send(game);
  }

  public async list(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 100);
    const result = await this._gameService.list(page, perPage);
    res.status(HttpStatus.OK).send(result);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Game Handler");
  }
}
