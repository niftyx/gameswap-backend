import { selectAccountByUserId as selectAccountByUserIdQuery } from "./queries";

import { request } from "./request";
import { AccountData, QueryAccountData } from "./types";

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
