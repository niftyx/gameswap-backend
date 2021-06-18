import { BigNumber } from "ethers";
import { IAssetHistory } from "../types";

export const assetHistoryUtils = {
  toSnakeCase: function (payload: any): IAssetHistory {
    const obj: any = {};
    Object.keys(payload || {}).forEach((key) => {
      obj[toSnakeCase(key)] = (payload || {})[key];
    });
    return obj as IAssetHistory;
  },
  toBNObj: function (payload: any): IAssetHistory {
    return {
      ...payload,
      erc20_amount: payload.erc20_amount
        ? BigNumber.from(payload.erc20_amount)
        : undefined,
    } as IAssetHistory;
  },
  toStrObj: function (payload: IAssetHistory): any {
    return {
      ...payload,
      erc20_amount: payload.erc20_amount
        ? payload.erc20_amount.toString()
        : undefined,
    };
  },
};
