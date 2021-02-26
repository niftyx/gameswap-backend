import { BigNumber } from "ethers";
import { isAddress } from "ethers/lib/utils";
import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { AssetService } from "../services/asset_service";

export class AssetHandler {
  private readonly _assetService: AssetService;

  constructor(assetService: AssetService) {
    this._assetService = assetService;
  }
  public async create(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send();
  }

  public async get(req: express.Request, res: express.Response): Promise<void> {
    const { id } = req.params;
    const asset = await this._assetService.getWithDetails(id);
    res.status(HttpStatus.OK).send(asset);
  }

  public async list(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 100);
    const result = await this._assetService.list(page, perPage);
    res.status(HttpStatus.OK).send(result);
  }

  public async getByCollectionIdAndAssetId(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { assetId, collectionId } = req.params;
    const asset = await this._assetService.getFullDetailsByTokenIdAndCollectionId(
      BigNumber.from(assetId),
      collectionId
    );
    res.status(HttpStatus.OK).send(asset);
  }

  public async listByAddress(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.perPage || 100);
    const address = req.params.id;
    if (!isAddress(address)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }
    const result = await this._assetService.listByAddress(
      address.toLowerCase(),
      page,
      perPage
    );
    res.status(HttpStatus.OK).send(result);
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Collection Handler");
  }
}
