import { getDefaultAppDependenciesAsync } from "../app";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import { getContractAddressesForChainOrThrow } from "../custom/contract-addresses";

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
      const contractAddresses = getContractAddressesForChainOrThrow(CHAIN_ID);
      await dependencies.factoryService.resetRelatedTables();
      const erc721Contracts = await dependencies.factoryService.syncERC721Contracts();

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
          dependencies.assetHistoryService,
          dependencies.orderService,
          dependencies.gameService,
          contractAddresses.exchange
        );
        await erc721Service.syncAssets();
      }
      await dependencies.exchangeService.syncExchanges();
    } catch (e) {
      logger.error(`Error attempting to sync Assets, [${JSON.stringify(e)}]`);
    }
  })().catch((error) => logger.error(error.stack));
}
