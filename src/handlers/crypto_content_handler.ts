import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { CryptoContentService } from "../services/crypto_content_service";
import { v4 as uuidv4 } from "uuid";
import * as isValidUUID from "uuid-validate";
import { AssetService } from "../services/asset_service";
export class CryptoContentHandler {
  private readonly cryptoContentService: CryptoContentService;
  private readonly assetService: AssetService;

  constructor(
    cryptoContentService: CryptoContentService,
    assetService: AssetService
  ) {
    this.cryptoContentService = cryptoContentService;
    this.assetService = assetService;
  }
  public async encryptData(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { contentStr } = req.body;

    const contentId = uuidv4();
    const str = JSON.stringify({
      content: contentStr,
      contentId,
    });
    const lockedData = this.cryptoContentService.encryptContent(str);
    res.status(HttpStatus.OK).send({ lockedData, contentId });
  }

  public async decryptData(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { contentStr } = req.body;

    const decryptedData = this.cryptoContentService.decryptContent(contentStr);
    const { content, contentId } = JSON.parse(decryptedData);

    if (!isValidUUID(contentId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }

    const ownerAddress = "";

    const asset = await this.assetService.getForContentData(
      contentId,
      String(ownerAddress).toLowerCase()
    );

    if (asset) {
      res.status(HttpStatus.OK).send(content);
      return;
    }

    res.status(HttpStatus.UNAUTHORIZED).send();
  }

  public async root(
    _req: express.Request,
    res: express.Response
  ): Promise<void> {
    res.status(HttpStatus.OK).send("Root of Crypto Content Handler");
  }
}
