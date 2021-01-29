import { CryptoContentHandler } from "../handlers/crypto_content_handler";
import * as express from "express";

// tslint:disable-next-line:completed-docs
export function createCryptoContentRouter(): express.Router {
  const router = express.Router();
  const handlers = new CryptoContentHandler();

  router.get("/", handlers.root);

  router.post("/encrypt", handlers.encryptData);
  router.post("/decrypt", handlers.decryptData);

  return router;
}
