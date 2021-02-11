import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { CollectionService } from "../services/collection_service";
// import * as isValidUUID from "uuid-validate";
import { v4 as uuidv4 } from "uuid";
import * as isValidUUID from "uuid-validate";

export class CollectionHandler {
  private readonly _collectionService: CollectionService;

  constructor(collectionService: CollectionService) {
    this._collectionService = collectionService;
  }
  public async create(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const collectionId = uuidv4();
    const collection = await this._collectionService.addCollection({
      ...req.body,
      id: collectionId,
    });
    res.status(HttpStatus.OK).send(collection);
  }

  public async get(req: express.Request, res: express.Response): Promise<void> {
    const id = req.params.id;
    if (!isValidUUID(id)) {
      res.status(HttpStatus.NOT_FOUND).send();
      return;
    }
    const collection = await this._collectionService.getCollection(id);
    res.status(HttpStatus.OK).send(collection);
  }

  public async list(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 100);
    const result = await this._collectionService.listCollections(page, perPage);
    res.status(HttpStatus.OK).send(result);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Collection Handler");
  }
}
