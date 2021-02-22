import * as express from "express";
import * as HttpStatus from "http-status-codes";
import { CryptoContentService } from "../services/crypto_content_service";
import { v4 as uuidv4 } from "uuid";
import * as isValidUUID from "uuid-validate";
import { utils } from "ethers";
export class CryptoContentHandler {
  private readonly _cryptoContentService;
  constructor(cryptoContentService: CryptoContentService) {
    this._cryptoContentService = cryptoContentService;
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
    const lockedData = this._cryptoContentService.encryptContent(str);
    res.status(HttpStatus.OK).send({ lockedData, contentId });
  }

  public async decryptData(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const { contentStr, signedContentStr } = req.body;

    const decryptedData = this._cryptoContentService.decryptContent(contentStr);
    const { content, contentId } = JSON.parse(decryptedData);

    if (!isValidUUID(contentId)) {
      res.status(HttpStatus.BAD_REQUEST).send();
      return;
    }

    const msgHash = utils.hashMessage(contentStr);
    const msgHashBytes = utils.arrayify(msgHash);

    const ownerAddressFromRequest = utils.recoverAddress(
      msgHashBytes,
      signedContentStr
    );

    const ownerAddress = "";

    if (
      String(ownerAddressFromRequest).toLowerCase() ===
      String(ownerAddress).toLowerCase()
    ) {
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
