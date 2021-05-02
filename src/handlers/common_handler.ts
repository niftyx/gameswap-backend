import * as express from "express";
import * as HttpStatus from "http-status-codes";

import { CommonService } from "../services/common_service";

export class CommonHandler {
  private readonly commonService: CommonService;

  constructor(commonService: CommonService) {
    this.commonService = commonService;
  }

  public async checkCustomUrlUsable(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { url } = req.body;
    const usable = await this.commonService.checkCustomUrlUsable(
      url.toLowerCase()
    );
    res.status(HttpStatus.OK).send(usable);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Common Handler");
  }
}
