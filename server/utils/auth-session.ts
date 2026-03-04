import type { H3Event } from "h3";
import { deleteCookie, getCookie, setCookie } from "h3";

const DEFAULT_SESSION_COOKIE_NAME = "sable.session";
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;
const DEFAULT_ONBOARDING_COOKIE_NAME = "sable.onboarding-session";
const DEFAULT_ONBOARDING_MAX_AGE_SECONDS = 60 * 30;

export function getSessionCookieConfig(event: H3Event) {
  return {
    cookieName: DEFAULT_SESSION_COOKIE_NAME,
    maxAge: DEFAULT_SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getOnboardingSessionCookieConfig(event: H3Event) {
  return {
    cookieName: DEFAULT_ONBOARDING_COOKIE_NAME,
    maxAge: DEFAULT_ONBOARDING_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getAuthSessionCookie(event: H3Event) {
  const { cookieName } = getSessionCookieConfig(event);
  return getCookie(event, cookieName);
}

export function getOnboardingSessionCookie(event: H3Event) {
  const { cookieName } = getOnboardingSessionCookieConfig(event);
  return getCookie(event, cookieName);
}

export function setAuthSessionCookie(event: H3Event, value: string) {
  const { cookieName, maxAge, secure } = getSessionCookieConfig(event);

  setCookie(event, cookieName, value, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function setOnboardingSessionCookie(event: H3Event, value: string) {
  const { cookieName, maxAge, secure } = getOnboardingSessionCookieConfig(
    event,
  );

  setCookie(event, cookieName, value, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function clearAuthSessionCookie(event: H3Event) {
  const { cookieName, secure } = getSessionCookieConfig(event);

  deleteCookie(event, cookieName, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });
}

export function clearOnboardingSessionCookie(event: H3Event) {
  const { cookieName, secure } = getOnboardingSessionCookieConfig(event);

  deleteCookie(event, cookieName, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });
}
