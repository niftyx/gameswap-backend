import { BigNumber, Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { Connection } from "typeorm";
import { assetDataUtils } from "@0x/order-utils";
import { logger } from "../app";
import { CHAIN_ID, defaultHttpServiceWithRateLimiterConfig } from "../config";
import { AssetService } from "./asset_service";
import { AssetHistoryService } from "./asset_history_service";
import { OrderService } from "./order_service";
import { ERC20_ASSET_PROXY_ID, ERC721_ASSET_PROXY_ID } from "../constants";

const abi = [
  "event Fill(address indexed,address indexed,bytes,bytes,bytes,bytes,bytes32 indexed,address,address,uint256,uint256,uint256,uint256,uint256)",
];

export class ExchangeService {
  private readonly _address: string;
  private readonly _blockNumber: number;
  //private readonly _connection: Connection;
  // private readonly _assetService: AssetService;
  private readonly _assetHistoryService: AssetHistoryService;
  // private readonly _orderService: OrderService;

  constructor(
    _address: string,
    _blockNumber: number,
    _connection: Connection,
    _assetService: AssetService,
    _assetHistoryService: AssetHistoryService,
    _orderService: OrderService
  ) {
    //this._connection = _connection;
    this._address = _address;
    this._blockNumber = _blockNumber;
    // this._assetService = _assetService;
    this._assetHistoryService = _assetHistoryService;
    // this._orderService = _orderService;
  }

  async syncExchanges() {
    const provider = new ethers.providers.JsonRpcProvider(
      defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl,
      CHAIN_ID
    );
    const iface = new Interface(abi);
    const ens = new Contract(this._address, iface, provider);

    let filter: any = ens.filters.Fill();
    filter.fromBlock = this._blockNumber;
    filter.toBlock = "latest";

    logger.info("==== Exchange Sync Start ===");

    const logs = await provider.getLogs(filter);

    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];
      // const _blockNumber = log.blockNumber;
      // const block = await provider.getBlock(blockNumber);
      const parsed = iface.parseLog(log);
      const orderFillInfo = {
        makerAddress: String(parsed.args[0]).toLowerCase(),
        feeRecipientAddress: String(parsed.args[1]).toLowerCase(),
        makerAssetData: parsed.args[2],
        takerAssetData: parsed.args[3],
        makerFeeAssetData: parsed.args[4],
        takerFeeAssetData: parsed.args[5],
        orderHash: String(parsed.args[6]),
        takerAddress: String(parsed.args[7]).toLowerCase(),
        senderAddress: String(parsed.args[8]).toLowerCase(),
        makerAssetFilledAmount: parsed.args[9] as BigNumber,
        takerAssetFilledAmount: parsed.args[10] as BigNumber,
        makerFeePaid: parsed.args[11] as BigNumber,
        takerFeePaid: parsed.args[12] as BigNumber,
        protocolFeePaid: parsed.args[13] as BigNumber,
      };

      const makerAsset = assetDataUtils.decodeAssetDataOrThrow(
        orderFillInfo.makerAssetData
      ) as any;
      const takerAsset = assetDataUtils.decodeAssetDataOrThrow(
        orderFillInfo.takerAssetData
      ) as any;
      const makerAssetProxyId = String(makerAsset.assetProxyId).toLowerCase();
      const takerAssetProxyId = String(takerAsset.assetProxyId).toLowerCase();

      const txHash = String(log.transactionHash).toLowerCase();
      logger.info(`====Order Filled => txHash${txHash}===`);
      if (
        makerAssetProxyId === ERC721_ASSET_PROXY_ID &&
        takerAssetProxyId === ERC20_ASSET_PROXY_ID
      ) {
        let assetHistory = await this._assetHistoryService.getByTxId(txHash);

        if (assetHistory) {
          assetHistory.erc20 = String(takerAsset.tokenAddress).toLowerCase();
          assetHistory.erc20Amount = orderFillInfo.takerAssetFilledAmount;

          logger.info(
            `====Order Filled ${assetHistory.erc20} ${assetHistory.erc20Amount}===`
          );

          assetHistory = await this._assetHistoryService.update(assetHistory);
          logger.info(assetHistory);
        }
      }
    }

    logger.info("==== Exchange Sync End ===");
  }

  async listenExchanges() {}
}
