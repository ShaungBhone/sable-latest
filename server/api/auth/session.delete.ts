import { clearAuthSessionCookie } from "../../utils/auth-session";

export default defineEventHandler(async (event) => {
  clearAuthSessionCookie(event);
  setResponseHeader(event, "Cache-Control", "no-store");

  return {
    ok: true,
  };
});
