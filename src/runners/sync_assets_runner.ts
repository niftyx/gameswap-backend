import { getDefaultAppDependenciesAsync } from "../app";
import { defaultHttpServiceWithRateLimiterConfig } from "../config";

import { logger } from "../logger";
import { ERC721Service } from "../services/erc721_service";

process.on("uncaughtException", (err) => {
  logger.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  if (err) {
    logger.error(err);
  }
});

if (require.main === module) {
  (async () => {
    const dependencies = await getDefaultAppDependenciesAsync(
      defaultHttpServiceWithRateLimiterConfig
    );
    // sync
    try {
      await dependencies.factoryService.resetRelatedTables();
      const erc721Contracts = await dependencies.factoryService.syncERC721Contracts();
      // const erc721Contracts = [
      //   { address: "0x3c563b93cf3cc1ad687f117a19c33cf4bb69ca8f", block: 39662 },
      //   { address: "0x1f98dc56314aa5fca8f676d10d6171867214fcc2", block: 40565 },
      // ];
      logger.info(erc721Contracts);

      for (let index = 0; index < erc721Contracts.length; index++) {
        const erc721 = erc721Contracts[index];
        const erc721Service = new ERC721Service(
          erc721.address,
          erc721.block,
          dependencies.connection,
          dependencies.collectionService,
          dependencies.collectionHistoryService,
          dependencies.accountService,
          dependencies.assetService,
          dependencies.assetHistoryService
        );
        await erc721Service.syncAssets();
      }
    } catch (e) {
      logger.error(`Error attempting to sync Assets, [${JSON.stringify(e)}]`);
    }
  })().catch((error) => logger.error(error.stack));
}
