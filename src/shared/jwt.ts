import { JWT as CONFIG_JWT } from "./config/authentication";

import { JWK, JWT } from "jose";

import { Claims, Token } from "./types";

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
