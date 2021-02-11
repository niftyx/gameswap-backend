import CryptoJS = require("crypto-js");

export class CryptoContentService {
  private readonly _secretKey: string;

  constructor(secretKey: string) {
    this._secretKey = secretKey;
  }

  public encryptContent(contentStr: string) {
    return CryptoJS.AES.encrypt(contentStr, this._secretKey).toString();
  }

  public decryptContent(contentStr: string) {
    const bytes = CryptoJS.AES.decrypt(contentStr, this._secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
