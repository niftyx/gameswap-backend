import {
  HASURA_ENDPOINT,
  HASURA_GRAPHQL_ADMIN_SECRET,
  HTTP_PORT,
  MAX_REQUESTS,
  TIME_FRAME,
} from "../../config";

/**
 * * Application Settings
 */
export const APPLICATION = {
  get HASURA_GRAPHQL_ADMIN_SECRET() {
    return HASURA_GRAPHQL_ADMIN_SECRET;
  },
  get HASURA_ENDPOINT() {
    return HASURA_ENDPOINT;
  },

  get PORT() {
    return HTTP_PORT;
  },

  get MAX_REQUESTS() {
    return MAX_REQUESTS;
  },
  get TIME_FRAME() {
    return TIME_FRAME;
  },
};
