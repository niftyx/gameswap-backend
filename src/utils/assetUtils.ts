import { BigNumber } from "ethers";
import { IAsset } from "../types";

export const assetUtils = {
  toSnakeCase: function (payload: any): IAsset {
    const obj: any = {};
    Object.keys(payload || {}).forEach((key) => {
      obj[toSnakeCase(key)] = (payload || {})[key];
    });
    return obj as IAsset;
  },
  toBNObj: function (payload: any): IAsset {
    return {
      ...payload,
      asset_id: BigNumber.from(payload.asset_id),
    } as IAsset;
  },
  toStrObj: function (payload: IAsset): any {
    return {
      ...payload,
      asset_id: payload.asset_id.toHexString(),
    };
  },
};
