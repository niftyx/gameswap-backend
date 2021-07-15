import { BigNumber } from "ethers";
import { IAsset } from "../types";

export const assetUtils = {
  /**
   * toBNObj convert bignumber string object to BigNumber object
   * @param payload {any} assetHistoryObject with bignumber strings
   * @returns {IAsset} assetHistoryObject with BigNumber
   */
  toBNObj: function (payload: any): IAsset {
    return {
      ...payload,
      asset_id: BigNumber.from(payload.asset_id),
    } as IAsset;
  },

  /**
   * toBNObj convert big number object child to string
   * @param {IAsset} assetObject with BigNumber
   * @returns {any} assetObject with bignumber strings
   */
  toStrObj: function (payload: IAsset): any {
    return {
      ...payload,
      asset_id: payload.asset_id.toHexString(),
    };
  },
};
