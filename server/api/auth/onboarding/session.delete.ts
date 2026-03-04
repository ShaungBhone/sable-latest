import { clearOnboardingSessionCookie } from "../../../utils/auth-session";

export default defineEventHandler(async (event) => {
  clearOnboardingSessionCookie(event);
  setResponseHeader(event, "Cache-Control", "no-store");

  return {
    ok: true,
  };
});
