import { logger } from "../app";

const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");

export class OrbitService {
  private orbitDb: any;
  private userDb: any;

  constructor() {
    this.orbitDb = null;
    this.userDb = null;
    this.initDB();
  }

  private async initDB() {
    const ipfsOptions = { repo: "./ipfs" };
    try {
      const ipfs = await IPFS.create(ipfsOptions);
      this.orbitDb = await OrbitDB.createInstance(ipfs);
      // logger.info("===connecting to peers===");
      //   this.userDb = await this.orbitDb.open(
      //     "/orbitdb/QmW4YH5DnVePSC6HrT3ypdn85K2mEA9S2grxRNWtRw51S5/users",
      //     { sync: true }
      //   );
      logger.info("===opened===");
      this.userDb = await this.orbitDb.keyvalue("users");
      logger.info(this.orbitDb.id);
      logger.info(this.userDb.address);
    } catch (error) {
      logger.info("====error===");
      logger.error(error);
    }
  }
}
