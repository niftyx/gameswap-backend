import * as express from "express";
import * as HttpStatus from "http-status-codes";

export class CryptoContentHandler {
  constructor() {}
  public async encryptData(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    console.log(req.body);
    res.status(HttpStatus.OK).send();
  }

  public async decryptData(
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
    res.status(HttpStatus.OK).send("Root of Crypto Content Handler");
  }
}
