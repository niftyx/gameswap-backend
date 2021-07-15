import { BigNumber } from "ethers";
import { IAssetHistory } from "../types";

/**
 * assetHistoryUtils
 *
 */

export const assetHistoryUtils = {
  /**
   * toBNObj convert bignumber string object to BigNumber object
   * @param payload {any} assetHistoryObject with bignumber strings
   * @returns {IAssetHistory} assetHistoryObject with BigNumber
   */
  toBNObj: function (payload: any): IAssetHistory {
    return {
      ...payload,
      erc20_amount: payload.erc20_amount
        ? BigNumber.from(payload.erc20_amount)
        : undefined,
    } as IAssetHistory;
  },

  /**
   * toBNObj convert big number object child to string
   * @param {IAssetHistory} assetHistoryObject with BigNumber
   * @returns {any} assetHistoryObject with bignumber strings
   */
  toStrObj: function (payload: IAssetHistory): any {
    return {
      ...payload,
      erc20_amount: payload.erc20_amount
        ? payload.erc20_amount.toString()
        : undefined,
    };
  },
};
