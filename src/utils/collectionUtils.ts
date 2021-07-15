import { BigNumber } from "ethers";
import { ICollection } from "../types";

export const collectionUtils = {
  /**
   * toBNObj convert bignumber string object to BigNumber object
   * @param payload {any} collection with bignumber strings
   * @returns {ICollection} collection with BigNumber
   */
  toBNObj: function (payload: any): ICollection {
    return {
      ...payload,
      total_supply: BigNumber.from(payload.total_supply || "0"),
      total_minted: BigNumber.from(payload.total_minted || "0"),
      total_burned: BigNumber.from(payload.total_burned || "0"),
    } as ICollection;
  },

  /**
   * toBNObj convert big number object child to string
   * @param {ICollection} assetObject with BigNumber
   * @returns {any} collection with bignumber strings
   */
  toStrObj: function (payload: ICollection): any {
    return {
      ...payload,
      total_supply: payload.total_supply.toString(),
      total_minted: payload.total_minted.toString(),
      total_burned: payload.total_burned.toString(),
    };
  },
};
