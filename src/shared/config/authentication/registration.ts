import { DEFAULT_ANONYMOUS_ROLE, DEFAULT_USER_ROLE } from "../../../config";

/**
 * * Registration settings
 */
export const REGISTRATION = {
  get DEFAULT_USER_ROLE() {
    return DEFAULT_USER_ROLE;
  },
  get DEFAULT_ANONYMOUS_ROLE() {
    return DEFAULT_ANONYMOUS_ROLE;
  },
  get DEFAULT_ALLOWED_USER_ROLES() {
    return [DEFAULT_USER_ROLE];
  },
  get ALLOWED_USER_ROLES() {
    return [DEFAULT_USER_ROLE];
  },
};
