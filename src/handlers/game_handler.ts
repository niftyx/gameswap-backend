import * as express from "express";
import * as HttpStatus from "http-status-codes";

export class GameHandler {
  constructor() {}
  public async create(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    console.log(req.body);
    res.status(HttpStatus.OK).send();
  }

  public async get(req: express.Request, res: express.Response): Promise<void> {
    console.log(req.body);
    res.status(HttpStatus.OK).send();
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
