import { BigNumber } from "@0x/utils";

// tslint:disable:custom-no-magic-numbers

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const NULL_BYTES = "0x";
export const ZRX_DECIMALS = 18;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);
export const DEFAULT_LOCAL_POSTGRES_URI = "postgres://api:api@localhost/api";
export const DEFAULT_LOGGER_INCLUDE_TIMESTAMP = true;
export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
export const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;

// API namespaces
export const CRYPTO_CONTENT_PATH = "/lock-content/v1";
export const GAME_PATH = "/games/v1";
export const USER_PATH = "/users/v1";
export const COMMON_PATH = "/common/v1";

export const HEALTHCHECK_PATH = "/healthz";

export const ETH_DECIMALS = 18;
export const GWEI_DECIMALS = 9;
export const LOG_PAGE_COUNT = 510;

// async rate limit
export const RPC_RATE_LIMIT = 10;

export const ERC20_ASSET_PROXY_ID = "0xf47261b0";
export const ERC721_ASSET_PROXY_ID = "0x02571792";

// custom url can't be the followings basically
export const BANNED_CUSTOM_URLS = [
  "trade",
  "assets",
  "games",
  "collections",
  "browse",
  "faq",
  "create",
  "users",
  "settings",
];
