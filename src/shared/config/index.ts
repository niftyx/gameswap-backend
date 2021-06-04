import { APPLICATION } from "./application";
export * from "./application";
export * from "./authentication";
export * from "./headers";

/**
 * * Check required settings, and raise an error if some are missing.
 */
if (!APPLICATION.HASURA_ENDPOINT) {
  throw new Error("No Hasura GraphQL endpoint found.");
}
