import { getDefaultAppDependenciesAsync } from "../app";
import {
  defaultHttpServiceWithRateLimiterConfig,
  EXCHANGE_CONTRACT,
} from "../config";

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

/**
 * * This runner will get past Events on AVAX Fuji Network (related to collections/assets/orders) and write data on db
 */

if (require.main === module) {
  (async () => {
    const dependencies = await getDefaultAppDependenciesAsync(
      defaultHttpServiceWithRateLimiterConfig
    );
    // sync
    try {
      // remove all collections/assets data on database first
      await dependencies.factoryService.resetRelatedTables();

      // read CollectionCreation events on avax and write on db
      const erc721Contracts =
        await dependencies.factoryService.syncERC721Contracts();
      // const erc721Contracts = await dependencies.collectionService.listForSync(
      //   0,
      //   10
      // );

      for (let index = 0; index < erc721Contracts.length; index++) {
        const erc721 = erc721Contracts[index];
        const erc721Service = new ERC721Service(
          erc721.address,
          erc721.block,
          dependencies.collectionService,
          dependencies.collectionHistoryService,
          dependencies.userService,
          dependencies.assetService,
          dependencies.assetHistoryService,
          dependencies.gameService,
          EXCHANGE_CONTRACT
        );
        // for each contract, get asset related events and write on db
        await erc721Service.syncAssets();
      }
      await dependencies.exchangeService.syncExchanges();
    } catch (e) {
      logger.error(`Error attempting to sync Assets, [${JSON.stringify(e)}]`);
    }
  })().catch((error) => logger.error(error.stack));
}
