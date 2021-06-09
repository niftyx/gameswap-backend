import {
  JWT_ALGORITHM,
  JWT_CLAIMS_NAMESPACE,
  JWT_EXPIRES_IN,
  JWT_SECRET_KEY,
} from "../../../config";

export const JWT = {
  get KEY() {
    return JWT_SECRET_KEY;
  },
  get ALGORITHM() {
    return JWT_ALGORITHM;
  },
  get CLAIMS_NAMESPACE() {
    return JWT_CLAIMS_NAMESPACE;
  },
  get EXPIRES_IN() {
    return JWT_EXPIRES_IN;
  },
};
