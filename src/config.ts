import * as _ from "lodash";

import {
  DEFAULT_LOCAL_POSTGRES_URI,
  DEFAULT_LOGGER_INCLUDE_TIMESTAMP,
} from "./constants";
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
  ? ChainId.AVAXTEST
  : assertEnvVarType("CHAIN_ID", process.env.CHAIN_ID, EnvVarType.ChainId);

// CONTENT_SECRET_KEY
export const CONTENT_SECRET_KEY: string =
  process.env.CONTENT_SECRET_KEY || "CONTENT_SECRET_KEY";

export const POSTGRES_URI =
  process.env.POSTGRES_URI || DEFAULT_LOCAL_POSTGRES_URI;

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

// Ethereum RPC Url
export const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "";

export const ERC721FACTORY_CONTRACT = process.env.ERC721FACTORY_CONTRACT || "";

export const ERC721FACTORY_CONTRACT_BLOCK = Number(
  process.env.ERC721FACTORY_CONTRACT_BLOCK || "0"
);

export const EXCHANGE_CONTRACT = process.env.EXCHANGE_CONTRACT || "";

export const EXCHANGE_CONTRACT_BLOCK = assertEnvVarType(
  "EXCHANGE_CONTRACT_BLOCK",
  process.env.EXCHANGE_CONTRACT_BLOCK,
  EnvVarType.Integer
);

export const HASURA_ENDPOINT: string = process.env.HASURA_ENDPOINT || "";
export const HASURA_GRAPHQL_ADMIN_SECRET: string =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET || "";

export const COOKIE_SECRET_KEY: string = process.env.COOKIE_SECRET || "";

export const JWT_SECRET_KEY: string = process.env.JWT_SECRET || "aa";
export const JWT_ALGORITHM: string = process.env.JWT_ALGORITHM || "HS256";
export const JWT_CLAIMS_NAMESPACE: string =
  process.env.JWT_CLAIMS_NAMESPACE || "";
export const JWT_EXPIRES_IN: number = Number(
  process.env.JWT_EXPIRES_IN || "15"
);

export const MAX_REQUESTS: number = Number(process.env.MAX_REQUESTS || "100");
export const TIME_FRAME: number = Number(process.env.TIME_FRAME || "900000");

export const DEFAULT_USER_ROLE: string =
  process.env.DEFAULT_USER_ROLE || "user";
export const DEFAULT_ANONYMOUS_ROLE: string =
  process.env.DEFAULT_ANONYMOUS_ROLE || "user";

export const defaultHttpServiceConfig: HttpServiceConfig = {
  httpPort: HTTP_PORT,
  healthcheckHttpPort: HEALTHCHECK_HTTP_PORT,
  httpKeepAliveTimeout: HTTP_KEEP_ALIVE_TIMEOUT,
  httpHeadersTimeout: HTTP_HEADERS_TIMEOUT,
  ethereumRpcUrl: ETHEREUM_RPC_URL,
  factoryContractAddress: ERC721FACTORY_CONTRACT,
  factoryBlockNumber: ERC721FACTORY_CONTRACT_BLOCK,
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

    case EnvVarType.Boolean:
      return value === "true";
    default:
      throw new Error(
        `Unrecognised EnvVarType: ${expectedType} encountered for variable ${name}.`
      );
  }
}
