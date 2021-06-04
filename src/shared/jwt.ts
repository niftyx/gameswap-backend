import { JWT as CONFIG_JWT, REGISTRATION } from "./config/authentication";

import { JWK, JWKS, JWT } from "jose";

import { Claims, Token, AccountData, ClaimValueType } from "./types";

const RSA_TYPES = ["RS256", "RS384", "RS512"];
const SHA_TYPES = ["HS256", "HS384", "HS512"];

let jwtKey: string | JWK.RSAKey | JWK.ECKey | JWK.OKPKey | JWK.OctKey =
  CONFIG_JWT.KEY;

/**
 * * Sets the JWT Key.
 * * If RSA algorithm, then checks if the PEM has been passed on through the JWT_KEY
 * * If not, tries to read the private.pem file, or generates it otherwise
 * * If SHA algorithm, then uses the JWT_KEY environment variables
 */
if (RSA_TYPES.includes(CONFIG_JWT.ALGORITHM)) {
  if (jwtKey) {
    try {
      jwtKey = JWK.asKey(jwtKey, { alg: CONFIG_JWT.ALGORITHM });
      jwtKey.toPEM(true);
    } catch (error) {
      ``;
      throw new Error(
        "Invalid RSA private key in the JWT_KEY environment variable."
      );
    }
  }
} else if (SHA_TYPES.includes(CONFIG_JWT.ALGORITHM)) {
  if (!jwtKey) {
    throw new Error("Empty JWT secret key.");
  }
} else {
  throw new Error(`Invalid JWT algorithm: ${CONFIG_JWT.ALGORITHM}`);
}

export const newJwtExpiry = CONFIG_JWT.EXPIRES_IN * 60 * 1000;

/**
 * Create an object that contains all the permission variables of the user,
 * i.e. user-id, allowed-roles, default-role and the kebab-cased columns
 * of the public.tables columns defined in JWT_CUSTOM_FIELDS
 * @param jwt if true, add a 'x-hasura-' prefix to the property names, and stringifies the values (required by Hasura)
 */
export function generatePermissionVariables(
  accountData: AccountData,
  jwt = false
): { [key: string]: ClaimValueType } {
  const prefix = jwt ? "x-hasura-" : "";
  const role = REGISTRATION.DEFAULT_USER_ROLE;
  const accountRoles = REGISTRATION.DEFAULT_ALLOWED_USER_ROLES;

  if (!accountRoles.includes(role)) {
    accountRoles.push(role);
  }

  return {
    [`${prefix}user-id`]: accountData.id,
    [`${prefix}allowed-roles`]: accountRoles,
    [`${prefix}default-role`]: role,
  };
}

/**
 * * Creates a JWKS store. Only works with RSA algorithms. Raises an error otherwise
 * @returns JWKS store
 */
export const getJwkStore = (): JWKS.KeyStore => {
  if (RSA_TYPES.includes(CONFIG_JWT.ALGORITHM)) {
    const keyStore = new JWKS.KeyStore();
    keyStore.add(jwtKey as JWK.RSAKey);
    return keyStore;
  }
  throw new Error("JWKS is not implemented on this server.");
};

/**
 * * Signs a payload with the existing JWT configuration
 */
export const sign = (payload: object, accountData: AccountData): string =>
  JWT.sign(payload, jwtKey, {
    algorithm: CONFIG_JWT.ALGORITHM,
    expiresIn: `${CONFIG_JWT.EXPIRES_IN}m`,
    subject: accountData.id,
    issuer: "gswap-auth-service",
  });

/**
 * Verify JWT token and return the Hasura claims.
 * @param authorization Authorization header.
 */
export const getClaims = (authorization: string | undefined): Claims => {
  if (!authorization) throw new Error("Missing Authorization header.");
  const token = authorization.replace("Bearer ", "");
  try {
    const decodedToken = JWT.verify(token, jwtKey) as Token;
    if (!decodedToken[CONFIG_JWT.CLAIMS_NAMESPACE])
      throw new Error("Claims namespace not found.");
    return decodedToken[CONFIG_JWT.CLAIMS_NAMESPACE];
  } catch (err) {
    throw new Error("Invalid or expired JWT token.");
  }
};

/**
 * Create JWT token.
 */
export const createHasuraJwt = (accountData: AccountData): string =>
  sign(
    {
      [CONFIG_JWT.CLAIMS_NAMESPACE]: generatePermissionVariables(
        accountData,
        true
      ),
    },
    accountData
  );
