import { BigNumber } from "ethers";

export enum ChainId {
  AVAXTEST = 43113,
  AVAXMAIN = 43114,
}

export interface HttpServiceConfig {
  httpPort: number;
  healthcheckHttpPort: number;
  httpKeepAliveTimeout: number;
  httpHeadersTimeout: number;
  ethereumRpcUrl: string;
  factoryContractAddress: string;
  factoryBlockNumber: number;
}
// Collection

export interface IGame {
  id: string;
  name: string;
  version: string;
  image_url: string;
  custom_url: string;
  header_image_url?: string;
  category_id: string;
  description: string;
  platform: string;
  is_verified: boolean;
  is_premium: boolean;
  is_featured: boolean;
  create_time_stamp: number;
  update_time_stamp: number;
  owner_id: string;
}

export interface IAsset {
  id: string;
  asset_id: BigNumber;
  asset_url: string;
  game_id: string;
  collection_id: string;
  content_id: string;
  create_time_stamp: number;
  update_time_stamp: number;
  owner_id: string;
  creator_id: string;
}

export interface IAssetHistory {
  id: string;
  owner_id: string;
  txHash: string;
  timestamp: number;
  asset_id: string;
  erc20?: string;
  erc20Amount?: BigNumber;
}

export interface ICollection {
  id: string;
  address: string;
  name: string;
  symbol: string;
  image_url: string;
  description?: string;
  total_supply: BigNumber;
  total_minted: BigNumber;
  total_burned: BigNumber;
  block: number;
  is_private: boolean;
  is_verified: boolean;
  is_premium: boolean;
  is_featured: boolean;
  create_time_stamp: number;
  update_time_stamp: number;
  owner_id: string;
  game_ids: string;
}

export interface ICollectionHistory {
  id: string;
  owner_id: string;
  timestamp: number;
  collection_id: string;
  txHash: string;
}

export interface IUser {
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

export enum ZeroXOrderType {
  Created = "Created",
  Filled = "Filled",
  Cancelled = "Cancelled",
}

export interface IERC721ContractInfo {
  address: string;
  block: number;
}
