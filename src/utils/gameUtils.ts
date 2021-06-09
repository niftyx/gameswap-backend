import { IGame } from "../types";

export const gameUtils = {
  toSnakeCase: function (payload: any): IGame {
    const obj: any = {};
    Object.keys(payload || {}).forEach((key) => {
      obj[toSnakeCase(key)] = (payload || {})[key];
    });
    return obj as IGame;
  },
};
