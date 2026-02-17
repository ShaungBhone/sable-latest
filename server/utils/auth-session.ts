import type { H3Event } from "h3";
import { deleteCookie, getCookie, setCookie } from "h3";

const DEFAULT_SESSION_COOKIE_NAME = "sable.session";
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5;

export function getSessionCookieConfig(event: H3Event) {
  const config = useRuntimeConfig(event);
  const cookieName =
    config.auth.sessionCookieName || DEFAULT_SESSION_COOKIE_NAME;
  const maxAge = Number(
    config.auth.sessionMaxAgeSeconds || DEFAULT_SESSION_MAX_AGE_SECONDS,
  );

  return {
    cookieName,
    maxAge,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getAuthSessionCookie(event: H3Event) {
  const { cookieName } = getSessionCookieConfig(event);
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

export function clearAuthSessionCookie(event: H3Event) {
  const { cookieName, secure } = getSessionCookieConfig(event);

  deleteCookie(event, cookieName, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  });
}
