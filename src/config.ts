// tslint:disable:custom-no-magic-numbers max-file-line-count
import { assert } from "@0x/assert";
import {
  BlockParamLiteral,
  ERC20BridgeSource,
  SamplerOverrides,
  SOURCE_FLAGS,
  SwapQuoteRequestOpts,
} from "@0x/asset-swapper";
import { BigNumber } from "@0x/utils";
import * as _ from "lodash";

import {
  DEFAULT_ETH_GAS_STATION_API_URL,
  DEFAULT_EXPECTED_MINED_SEC,
  DEFAULT_FALLBACK_SLIPPAGE_PERCENTAGE,
  DEFAULT_LOCAL_POSTGRES_URI,
  DEFAULT_LOGGER_INCLUDE_TIMESTAMP,
  DEFAULT_QUOTE_SLIPPAGE_PERCENTAGE,
  NULL_ADDRESS,
  TX_BASE_GAS,
} from "./constants";
import {
  ERC20TokenMetaDatasForChains,
  Test721TokenMetaData,
} from "./token_metadatas_for_networks";
import { ChainId, HttpServiceConfig } from "./types";

enum EnvVarType {
  AddressList,
  StringList,
  Integer,
  Port,
  KeepAliveTimeout,
  ChainId,
  ETHAddressHex,
  UnitAmount,
  Url,
  UrlList,
  Boolean,
  NonEmptyString,
}

// Log level for pino.js
export const LOG_LEVEL: string = _.isEmpty(process.env.LOG_LEVEL)
  ? "info"
  : assertEnvVarType(
      "LOG_LEVEL",
      process.env.LOG_LEVEL,
      EnvVarType.NonEmptyString
    );

// Network port to listen on
export const HTTP_PORT = _.isEmpty(process.env.HTTP_PORT)
  ? 3000
  : assertEnvVarType("HTTP_PORT", process.env.HTTP_PORT, EnvVarType.Port);

// Network port for the healthcheck service at /healthz, if not provided, it uses the HTTP_PORT value.
export const HEALTHCHECK_HTTP_PORT = _.isEmpty(
  process.env.HEALTHCHECK_HTTP_PORT
)
  ? HTTP_PORT
  : assertEnvVarType(
      "HEALTHCHECK_HTTP_PORT",
      process.env.HEALTHCHECK_HTTP_PORT,
      EnvVarType.Port
    );

// Number of milliseconds of inactivity the servers waits for additional
// incoming data aftere it finished writing last response before a socket will
// be destroyed.
// Ref: https://nodejs.org/api/http.html#http_server_keepalivetimeout
export const HTTP_KEEP_ALIVE_TIMEOUT = _.isEmpty(
  process.env.HTTP_KEEP_ALIVE_TIMEOUT
)
  ? 76 * 1000
  : assertEnvVarType(
      "HTTP_KEEP_ALIVE_TIMEOUT",
      process.env.HTTP_KEEP_ALIVE_TIMEOUT,
      EnvVarType.KeepAliveTimeout
    );

// Limit the amount of time the parser will wait to receive the complete HTTP headers.
// NOTE: This value HAS to be higher than HTTP_KEEP_ALIVE_TIMEOUT.
// Ref: https://nodejs.org/api/http.html#http_server_headerstimeout
export const HTTP_HEADERS_TIMEOUT = _.isEmpty(process.env.HTTP_HEADERS_TIMEOUT)
  ? 77 * 1000
  : assertEnvVarType(
      "HTTP_HEADERS_TIMEOUT",
      process.env.HTTP_HEADERS_TIMEOUT,
      EnvVarType.KeepAliveTimeout
    );

// Default chain id to use when not specified
export const CHAIN_ID: ChainId = _.isEmpty(process.env.CHAIN_ID)
  ? ChainId.Kovan
  : assertEnvVarType("CHAIN_ID", process.env.CHAIN_ID, EnvVarType.ChainId);

// Ignored addresses. These are ignored at the ingress (Mesh) level and are never stored.
export const MESH_IGNORED_ADDRESSES: string[] = _.isEmpty(
  process.env.MESH_IGNORED_ADDRESSES
)
  ? []
  : assertEnvVarType(
      "MESH_IGNORED_ADDRESSES",
      process.env.MESH_IGNORED_ADDRESSES,
      EnvVarType.AddressList
    );

// Ignored addresses only for Swap endpoints (still present in database and SRA).
export const SWAP_IGNORED_ADDRESSES: string[] = _.isEmpty(
  process.env.SWAP_IGNORED_ADDRESSES
)
  ? []
  : assertEnvVarType(
      "SWAP_IGNORED_ADDRESSES",
      process.env.SWAP_IGNORED_ADDRESSES,
      EnvVarType.AddressList
    );

// MMer addresses whose orders should be pinned to the Mesh node
export const PINNED_POOL_IDS: string[] = _.isEmpty(process.env.PINNED_POOL_IDS)
  ? []
  : assertEnvVarType(
      "PINNED_POOL_IDS",
      process.env.PINNED_POOL_IDS,
      EnvVarType.StringList
    );

// MMer addresses whose orders should be pinned to the Mesh node
export const PINNED_MM_ADDRESSES: string[] = _.isEmpty(
  process.env.PINNED_MM_ADDRESSES
)
  ? []
  : assertEnvVarType(
      "PINNED_MM_ADDRESSES",
      process.env.PINNED_MM_ADDRESSES,
      EnvVarType.AddressList
    );

// Mesh Endpoint
export const MESH_WEBSOCKET_URI = _.isEmpty(process.env.MESH_WEBSOCKET_URI)
  ? "ws://localhost:60557"
  : assertEnvVarType(
      "MESH_WEBSOCKET_URI",
      process.env.MESH_WEBSOCKET_URI,
      EnvVarType.Url
    );
export const MESH_HTTP_URI = _.isEmpty(process.env.MESH_HTTP_URI)
  ? undefined
  : assertEnvVarType(
      "assertEnvVarType",
      process.env.MESH_HTTP_URI,
      EnvVarType.Url
    );

// 0x Endpoint
export const SRA_WEBSOCKET_URIS = {
  [ChainId.Mainnet]: process.env.RELAYER_WS_URL_MAINNET || "",
  [ChainId.Kovan]: process.env.RELAYER_WS_URL_KOVAN || "",
};
export const SRA_WEBSOCKET_URI = SRA_WEBSOCKET_URIS[CHAIN_ID];
export const SRA_HTTP_URIS = {
  [ChainId.Mainnet]: process.env.RELAYER_URL_MAINNET || "",
  [ChainId.Kovan]: process.env.RELAYER_URL_KOVAN || "",
};
export const SRA_HTTP_URI = SRA_HTTP_URIS[CHAIN_ID];

// SUBGRAPN ENDPOINT
export const GSWAP_SUBGRAPH_WEBSOCKET_URIS = {
  [ChainId.Mainnet]: process.env.GRAPH_MAINNET_WS || "",
  [ChainId.Kovan]: process.env.GRAPH_KOVAN_WS || "",
};
export const GSWAP_SUBGRAPH_WEBSOCKET_URI =
  GSWAP_SUBGRAPH_WEBSOCKET_URIS[CHAIN_ID];
export const GSWAP_SUBGRAPH_HTTP_URIS = {
  [ChainId.Mainnet]: process.env.GRAPH_MAINNET_HTTP || "",
  [ChainId.Kovan]: process.env.GRAPH_KOVAN_HTTP || "",
};
export const GSWAP_SUBGRAPH_HTTP_URI = GSWAP_SUBGRAPH_HTTP_URIS[CHAIN_ID];

// CONTENT_SECRET_KEY
export const CONTENT_SECRET_KEY: string =
  process.env.CONTENT_SECRET_KEY || "CONTENT_SECRET_KEY";

// The fee recipient for orders
export const FEE_RECIPIENT_ADDRESS = _.isEmpty(
  process.env.FEE_RECIPIENT_ADDRESS
)
  ? NULL_ADDRESS
  : assertEnvVarType(
      "FEE_RECIPIENT_ADDRESS",
      process.env.FEE_RECIPIENT_ADDRESS,
      EnvVarType.ETHAddressHex
    );
// A flat fee that should be charged to the order maker
export const MAKER_FEE_UNIT_AMOUNT = _.isEmpty(
  process.env.MAKER_FEE_UNIT_AMOUNT
)
  ? new BigNumber(0)
  : assertEnvVarType(
      "MAKER_FEE_UNIT_AMOUNT",
      process.env.MAKER_FEE_UNIT_AMOUNT,
      EnvVarType.UnitAmount
    );
// A flat fee that should be charged to the order taker
export const TAKER_FEE_UNIT_AMOUNT = _.isEmpty(
  process.env.TAKER_FEE_UNIT_AMOUNT
)
  ? new BigNumber(0)
  : assertEnvVarType(
      "TAKER_FEE_UNIT_AMOUNT",
      process.env.TAKER_FEE_UNIT_AMOUNT,
      EnvVarType.UnitAmount
    );

// If there are any orders in the orderbook that are expired by more than x seconds, log an error
export const MAX_ORDER_EXPIRATION_BUFFER_SECONDS: number = _.isEmpty(
  process.env.MAX_ORDER_EXPIRATION_BUFFER_SECONDS
)
  ? 3 * 60
  : assertEnvVarType(
      "MAX_ORDER_EXPIRATION_BUFFER_SECONDS",
      process.env.MAX_ORDER_EXPIRATION_BUFFER_SECONDS,
      EnvVarType.KeepAliveTimeout
    );

// Ignore orders greater than x seconds when responding to SRA requests
export const SRA_ORDER_EXPIRATION_BUFFER_SECONDS: number = _.isEmpty(
  process.env.SRA_ORDER_EXPIRATION_BUFFER_SECONDS
)
  ? 10
  : assertEnvVarType(
      "SRA_ORDER_EXPIRATION_BUFFER_SECONDS",
      process.env.SRA_ORDER_EXPIRATION_BUFFER_SECONDS,
      EnvVarType.KeepAliveTimeout
    );

export const POSTGRES_URI = _.isEmpty(process.env.POSTGRES_URI)
  ? DEFAULT_LOCAL_POSTGRES_URI
  : assertEnvVarType("POSTGRES_URI", process.env.POSTGRES_URI, EnvVarType.Url);

export const POSTGRES_READ_REPLICA_URIS: string[] | undefined = _.isEmpty(
  process.env.POSTGRES_READ_REPLICA_URIS
)
  ? undefined
  : assertEnvVarType(
      "POSTGRES_READ_REPLICA_URIS",
      process.env.POSTGRES_READ_REPLICA_URIS,
      EnvVarType.UrlList
    );

// Should the logger include time field in the output logs, defaults to true.
export const LOGGER_INCLUDE_TIMESTAMP = _.isEmpty(
  process.env.LOGGER_INCLUDE_TIMESTAMP
)
  ? DEFAULT_LOGGER_INCLUDE_TIMESTAMP
  : assertEnvVarType(
      "LOGGER_INCLUDE_TIMESTAMP",
      process.env.LOGGER_INCLUDE_TIMESTAMP,
      EnvVarType.Boolean
    );

// tslint:disable-next-line:boolean-naming
export const RFQT_REQUEST_MAX_RESPONSE_MS = 600;

// The meta-txn relay sender private keys managed by the TransactionWatcher
export const META_TXN_RELAY_PRIVATE_KEYS: string[] = _.isEmpty(
  process.env.META_TXN_RELAY_PRIVATE_KEYS
)
  ? []
  : assertEnvVarType(
      "META_TXN_RELAY_PRIVATE_KEYS",
      process.env.META_TXN_RELAY_PRIVATE_KEYS,
      EnvVarType.StringList
    );

// The expected time for a meta-txn to be included in a block.
export const META_TXN_RELAY_EXPECTED_MINED_SEC: number = _.isEmpty(
  process.env.META_TXN_RELAY_EXPECTED_MINED_SEC
)
  ? DEFAULT_EXPECTED_MINED_SEC
  : assertEnvVarType(
      "META_TXN_RELAY_EXPECTED_MINED_SEC",
      process.env.META_TXN_RELAY_EXPECTED_MINED_SEC,
      EnvVarType.Integer
    );
// Should TransactionWatcherSignerService sign transactions
// tslint:disable-next-line:boolean-naming
export const META_TXN_SIGNING_ENABLED: boolean = _.isEmpty(
  process.env.META_TXN_SIGNING_ENABLED
)
  ? true
  : assertEnvVarType(
      "META_TXN_SIGNING_ENABLED",
      process.env.META_TXN_SIGNING_ENABLED,
      EnvVarType.Boolean
    );
// The maximum gas price (in gwei) the service will allow
export const META_TXN_MAX_GAS_PRICE_GWEI: BigNumber = _.isEmpty(
  process.env.META_TXN_MAX_GAS_PRICE_GWEI
)
  ? new BigNumber(50)
  : assertEnvVarType(
      "META_TXN_MAX_GAS_PRICE_GWEI",
      process.env.META_TXN_MAX_GAS_PRICE_GWEI,
      EnvVarType.UnitAmount
    );

// Whether or not prometheus metrics should be enabled.
// tslint:disable-next-line:boolean-naming
export const ENABLE_PROMETHEUS_METRICS: boolean = _.isEmpty(
  process.env.ENABLE_PROMETHEUS_METRICS
)
  ? false
  : assertEnvVarType(
      "ENABLE_PROMETHEUS_METRICS",
      process.env.ENABLE_PROMETHEUS_METRICS,
      EnvVarType.Boolean
    );

export const PROMETHEUS_PORT: number = _.isEmpty(process.env.PROMETHEUS_PORT)
  ? 8080
  : assertEnvVarType(
      "PROMETHEUS_PORT",
      process.env.PROMETHEUS_PORT,
      EnvVarType.Port
    );

// Eth Gas Station URL
export const ETH_GAS_STATION_API_URL: string = _.isEmpty(
  process.env.ETH_GAS_STATION_API_URL
)
  ? DEFAULT_ETH_GAS_STATION_API_URL
  : assertEnvVarType(
      "ETH_GAS_STATION_API_URL",
      process.env.ETH_GAS_STATION_API_URL,
      EnvVarType.Url
    );

// If true, Price-Aware RFQ feature will be enabled for RFQ-enabled requests
// tslint:disable-next-line:boolean-naming
export const FIRM_PRICE_AWARE_RFQ_ENABLED: boolean = _.isEmpty(
  process.env.FIRM_PRICE_AWARE_RFQ_ENABLED
)
  ? false
  : assertEnvVarType(
      "FIRM_PRICE_AWARE_RFQ_ENABLED",
      process.env.FIRM_PRICE_AWARE_RFQ_ENABLED,
      EnvVarType.Boolean
    );

// tslint:disable-next-line: boolean-naming
export const INDICATIVE_PRICE_AWARE_RFQ_ENABLED: boolean = _.isEmpty(
  process.env.INDICATIVE_PRICE_AWARE_RFQ_ENABLED
)
  ? false
  : assertEnvVarType(
      "INDICATIVE_PRICE_AWARE_RFQ_ENABLED",
      process.env.INDICATIVE_PRICE_AWARE_RFQ_ENABLED,
      EnvVarType.Boolean
    );

// Max number of entities per page
export const MAX_PER_PAGE = 1000;
// Default ERC20 token precision
export const DEFAULT_ERC20_TOKEN_PRECISION = 18;

export const PROTOCOL_FEE_MULTIPLIER = new BigNumber(70000);

export const RFQT_PROTOCOL_FEE_GAS_PRICE_MAX_PADDING_MULTIPLIER = 1.2;

const EXCLUDED_SOURCES = (() => {
  const allERC20BridgeSources = Object.values(ERC20BridgeSource);
  switch (CHAIN_ID) {
    case ChainId.Mainnet:
      return [ERC20BridgeSource.MultiBridge];
    case ChainId.Kovan:
      return allERC20BridgeSources.filter(
        (s) =>
          s !== ERC20BridgeSource.Native && s !== ERC20BridgeSource.UniswapV2
      );
    default:
      return allERC20BridgeSources.filter(
        (s) => s !== ERC20BridgeSource.Native
      );
  }
})();

const EXCLUDED_FEE_SOURCES = (() => {
  switch (CHAIN_ID) {
    case ChainId.Mainnet:
      return [];
    case ChainId.Kovan:
      return [ERC20BridgeSource.Uniswap];
    default:
      return [ERC20BridgeSource.Uniswap, ERC20BridgeSource.UniswapV2];
  }
})();

export const ASSET_SWAPPER_MARKET_ORDERS_OPTS: Partial<SwapQuoteRequestOpts> = {
  excludedSources: EXCLUDED_SOURCES,
  excludedFeeSources: EXCLUDED_FEE_SOURCES,
  bridgeSlippage: DEFAULT_QUOTE_SLIPPAGE_PERCENTAGE,
  maxFallbackSlippage: DEFAULT_FALLBACK_SLIPPAGE_PERCENTAGE,
  numSamples: 13,
  sampleDistributionBase: 1.05,
  exchangeProxyOverhead: (sourceFlags: number) => {
    if (
      [SOURCE_FLAGS.Uniswap_V2, SOURCE_FLAGS.SushiSwap].includes(sourceFlags)
    ) {
      return TX_BASE_GAS;
    } else if (SOURCE_FLAGS.LiquidityProvider === sourceFlags) {
      return TX_BASE_GAS.plus(10e3);
    } else {
      return new BigNumber(150e3);
    }
  },
  runLimit: 2 ** 8,
  shouldGenerateQuoteReport: false,
};

export const ASSET_SWAPPER_MARKET_ORDERS_OPTS_NO_VIP: Partial<SwapQuoteRequestOpts> = {
  ...ASSET_SWAPPER_MARKET_ORDERS_OPTS,
  exchangeProxyOverhead: () => new BigNumber(150e3),
};

export const SAMPLER_OVERRIDES: SamplerOverrides | undefined = (() => {
  switch (CHAIN_ID) {
    case ChainId.Kovan:
      return { overrides: {}, block: BlockParamLiteral.Latest };
    default:
      return undefined;
  }
})();

export const defaultHttpServiceConfig: HttpServiceConfig = {
  httpPort: HTTP_PORT,
  healthcheckHttpPort: HEALTHCHECK_HTTP_PORT,
  httpKeepAliveTimeout: HTTP_KEEP_ALIVE_TIMEOUT,
  httpHeadersTimeout: HTTP_HEADERS_TIMEOUT,
  enablePrometheusMetrics: ENABLE_PROMETHEUS_METRICS,
  prometheusPort: PROMETHEUS_PORT,
  meshWebsocketUri: MESH_WEBSOCKET_URI,
  meshHttpUri: MESH_HTTP_URI,
};

export const defaultHttpServiceWithRateLimiterConfig: HttpServiceConfig = {
  ...defaultHttpServiceConfig,
};

function assertEnvVarType(
  name: string,
  value: any,
  expectedType: EnvVarType
): any {
  let returnValue;
  switch (expectedType) {
    case EnvVarType.Port:
      returnValue = parseInt(value, 10);
      const isWithinRange = returnValue >= 0 && returnValue <= 65535;
      if (isNaN(returnValue) || !isWithinRange) {
        throw new Error(`${name} must be between 0 to 65535, found ${value}.`);
      }
      return returnValue;
    case EnvVarType.ChainId:
    case EnvVarType.KeepAliveTimeout:
    case EnvVarType.Integer:
      returnValue = parseInt(value, 10);
      if (isNaN(returnValue)) {
        throw new Error(`${name} must be a valid integer, found ${value}.`);
      }
      return returnValue;
    case EnvVarType.ETHAddressHex:
      assert.isETHAddressHex(name, value);
      return value;
    case EnvVarType.Url:
      assert.isUri(name, value);
      return value;
    case EnvVarType.UrlList:
      assert.isString(name, value);
      const urlList = (value as string).split(",");
      urlList.forEach((url, i) => assert.isUri(`${name}[${i}]`, url));
      return urlList;
    case EnvVarType.Boolean:
      return value === "true";
    case EnvVarType.UnitAmount:
      returnValue = new BigNumber(parseFloat(value));
      if (returnValue.isNaN() || returnValue.isNegative()) {
        throw new Error(`${name} must be valid number greater than 0.`);
      }
      return returnValue;
    case EnvVarType.AddressList:
      assert.isString(name, value);
      const addressList = (value as string)
        .split(",")
        .map((a) => a.toLowerCase());
      addressList.forEach((a, i) => assert.isETHAddressHex(`${name}[${i}]`, a));
      return addressList;
    case EnvVarType.StringList:
      assert.isString(name, value);
      const stringList = (value as string).split(",");
      return stringList;
    case EnvVarType.NonEmptyString:
      assert.isString(name, value);
      if (value === "") {
        throw new Error(`${name} must be supplied`);
      }
      return value;

    default:
      throw new Error(
        `Unrecognised EnvVarType: ${expectedType} encountered for variable ${name}.`
      );
  }
}

export const WHITELISTED_TOKENS: string[] = ERC20TokenMetaDatasForChains.map(
  (tm) => tm.tokenAddresses[CHAIN_ID]
);

export const ERC20TokenAddresses: string[] = ERC20TokenMetaDatasForChains.map(
  (tm) => tm.tokenAddresses[CHAIN_ID]
);
export const Test721TokenAddress =
  Test721TokenMetaData.tokenAddresses[CHAIN_ID];
