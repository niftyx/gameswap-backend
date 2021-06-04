import { COOKIE_SECRET_KEY } from "../../../config";

export const COOKIES = {
  get SECRET() {
    return COOKIE_SECRET_KEY;
  },
  get SECURE() {
    return true;
  },
  get SAME_SITE() {
    const sameSiteEnv = process.env.COOKIE_SAME_SITE?.toLowerCase();

    let sameSite: boolean | "lax" | "strict" | "none" = "lax";
    if (sameSiteEnv) {
      if (["true", "false"].includes(sameSiteEnv)) {
        sameSite = Boolean(sameSiteEnv);
      } else if (
        sameSiteEnv === "lax" ||
        sameSiteEnv === "strict" ||
        sameSiteEnv === "none"
      ) {
        sameSite = sameSiteEnv;
      }
    }

    return sameSite;
  },
};
