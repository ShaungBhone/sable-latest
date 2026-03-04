import type { RegisterUpdateUserInfoRequest } from "@/types/register";
import {
  clearOnboardingSessionCookie,
  getOnboardingSessionCookie,
  setAuthSessionCookie,
} from "../../utils/auth-session";
import { createUnauthorizedError } from "../../utils/http-errors";
import { updateRegisterUserInfo } from "../../utils/register-backend";

export default defineEventHandler(async (event) => {
  const onboardingSession = getOnboardingSessionCookie(event);

  if (!onboardingSession) {
    throw createUnauthorizedError("Missing onboarding session cookie.");
  }

  const body = await readBody<RegisterUpdateUserInfoRequest>(event);
  await updateRegisterUserInfo(event, onboardingSession, body);

  setAuthSessionCookie(event, onboardingSession);
  clearOnboardingSessionCookie(event);
  setResponseHeader(event, "Cache-Control", "no-store");

  return {
    ok: true,
  };
});
