import { COOKIES } from "./config/authentication";
import { selectAccountByUserId as selectAccountByUserIdQuery } from "./queries";

import { request } from "./request";
import {
  AccountData,
  QueryAccountData,
  PermissionVariables,
  RequestExtended,
} from "./types";

// TODO await request returns undefined if no user found!
export const selectAccountById = async (
  id: string | undefined
): Promise<AccountData | null> => {
  if (!id) {
    throw new Error("Invalid User Id.");
  }
  const hasuraData = await request<QueryAccountData>(
    selectAccountByUserIdQuery,
    { id }
  );
  if (!hasuraData.users[0]) return null;
  return hasuraData.users[0];
};

export const getPermissionVariablesFromCookie = (
  req: RequestExtended
): PermissionVariables => {
  const { permission_variables } = COOKIES.SECRET
    ? (req as any).signedCookies
    : (req as any).cookies;
  if (!permission_variables) throw new Error("No permission variables");
  return JSON.parse(permission_variables);
};
