import { CryptoContentHandler } from "../handlers/crypto_content_handler";
import * as express from "express";
import { CryptoContentService } from "../services/crypto_content_service";
import * as asyncHandler from "express-async-handler";
import CryptoContentValidation from "../validators/crypto_content.validation";
import { validate } from "express-validation";
import { AssetService } from "../services/asset_service";

// tslint:disable-next-line:completed-docs
export function createCryptoContentRouter(
  cryptoContentService: CryptoContentService,
  assetService: AssetService
): express.Router {
  const router = express.Router();
  const handlers = new CryptoContentHandler(cryptoContentService, assetService);

  router.get("/", handlers.root);

  router.post(
    "/encrypt",
    validate(CryptoContentValidation.encrypt),
    asyncHandler(handlers.encryptData.bind(handlers))
  );
  router.post(
    "/decrypt",
    validate(CryptoContentValidation.decrypt),
    asyncHandler(handlers.decryptData.bind(handlers))
  );

  return router;
}
