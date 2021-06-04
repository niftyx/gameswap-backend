import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { CollectionService } from "../services/collection_service";
import { v4 as uuidv4 } from "uuid";
import { isAddress } from "ethers/lib/utils";

export class CollectionHandler {
  private readonly collectionService: CollectionService;

  constructor(collectionService: CollectionService) {
    this.collectionService = collectionService;
  }
  public async create(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const collectionId = uuidv4();
    const collection = await this.collectionService.add({
      ...req.body,
      id: collectionId,
    });
    res.status(HttpStatus.OK).send(collection);
  }

  public async get(req: express.Request, res: express.Response): Promise<void> {
    const id = req.params.id;
    if (!isAddress(id)) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const collection = await this.collectionService.get(id);
    res.status(HttpStatus.OK).send(collection);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Collection Handler");
  }
}
