import { Request } from "express";

export type ClaimValueType =
  | string
  | string[]
  | number
  | number[]
  | RegExp
  | RegExp[]
  | boolean
  | boolean[]
  | null
  | undefined;

/**
 * Claims interface.
 */
export interface Claims {
  "x-hasura-user-id": string;
  "x-hasura-default-role": string;
  "x-hasura-allowed-roles": string[];
  [key: string]: ClaimValueType;
}

/**
 * PermissionVariables interface.
 */
export interface PermissionVariables {
  "user-id": string;
  "default-role": string;
  "allowed-roles": string[];
  [key: string]: ClaimValueType;
}

/**
 * Token interface.
 */
export type Token = {
  [key: string]: Claims;
} & {
  exp: bigint;
  iat: bigint;
  iss: string;
  sub: string;
};

export interface Session {
  jwt_token: string | null;
  jwt_expires_in: number | null;
  refresh_token?: string;
}

export interface UserData {
  [key: string]: ClaimValueType;
  id: string;
}

export interface AccountData {
  id: string;
  address: string;
  name: string;
  custom_url: string;
  image_url: string;
  header_image_url: string;
  bio: string;
  twitter_username: string;
  twitter_verified: boolean;
  twitch_username: string;
  facebook_username: string;
  youtube_username: string;
  instagram_username: string;
  tiktok_username: string;
  personal_site: string;
  create_time_stamp: number;
  update_time_stamp: number;
}

export interface QueryAccountData {
  users: AccountData[];
}

export interface InsertAccountData {
  insert_users: {
    returning: AccountData[];
  };
}

export interface UpdateAccountData {
  update_auth_accounts: {
    affected_rows: number;
    returning: {
      id: string;
    }[];
  };
}

export interface RefreshTokenMiddleware {
  value: string | null;
  type: "query" | "cookie" | null;
}

export interface RequestExtended extends Request {
  refresh_token?: RefreshTokenMiddleware;
  permission_variables?: PermissionVariables;
}
