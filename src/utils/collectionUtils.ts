import { BigNumber } from "ethers";
import { ICollection } from "../types";

export const collectionUtils = {
  toSnakeCase: function (payload: any): ICollection {
    const obj: any = {};
    Object.keys(payload || {}).forEach((key) => {
      obj[toSnakeCase(key)] = (payload || {})[key];
    });
    return obj as ICollection;
  },
  toBNObj: function (payload: any): ICollection {
    return {
      ...payload,
      total_supply: BigNumber.from(payload.total_supply || "0"),
      total_minted: BigNumber.from(payload.total_minted || "0"),
      total_burned: BigNumber.from(payload.total_burned || "0"),
    } as ICollection;
  },
  toStrObj: function (payload: ICollection): any {
    return {
      ...payload,
      total_supply: payload.total_supply.toString(),
      total_minted: payload.total_minted.toString(),
      total_burned: payload.total_burned.toString(),
    };
  },
};
