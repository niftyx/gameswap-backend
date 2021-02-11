import axios from "axios";
import { GraphVariables } from "../types";

export const subgraphUtils = {
  fetchQuery(query: string, variables: GraphVariables, endpoint: string) {
    return axios.post(endpoint, { query, variables });
  },
};
