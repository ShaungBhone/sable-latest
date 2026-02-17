import { useAuthStore } from "@/stores/auth";
import {
  getFirstAllowedPath,
  isGuestRoute,
  normalizeRoutePath,
  resolveRoutePermission,
} from "@/utils/permission-routing";

function getLocaleCodesFromNuxtApp() {
  const nuxtApp = useNuxtApp();
  const i18n = nuxtApp.$i18n;
  const rawLocales = i18n?.locales.value ?? [];

  return rawLocales.map((locale) =>
    typeof locale === "string" ? locale : locale.code,
  );
}

function getActiveLocale(path: string, localeCodes: string[]) {
  const firstSegment = path.split("/")[1];
  return firstSegment && localeCodes.includes(firstSegment)
    ? firstSegment
    : null;
}

function toLocalizedPath(path: string, activeLocale: string | null) {
  if (!activeLocale) {
    return path;
  }

  if (path.startsWith(`/${activeLocale}/`) || path === `/${activeLocale}`) {
    return path;
  }

  if (path === "/") {
    return `/${activeLocale}`;
  }

  return `/${activeLocale}${path}`;
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const localeCodes = getLocaleCodesFromNuxtApp();
  const activeLocale = getActiveLocale(to.path, localeCodes);
  const normalizedPath = normalizeRoutePath(to.path, localeCodes);

  if (!authStore.hydrated || authStore.status === "idle") {
    await authStore.fetchMe();
  }

  if (isGuestRoute(normalizedPath, localeCodes)) {
    if (authStore.isAuthenticated) {
      const targetPath = getFirstAllowedPath(authStore.permissions) ?? "/";
      const normalizedTarget = normalizeRoutePath(targetPath, localeCodes);

      if (normalizedTarget !== normalizedPath) {
        return navigateTo(toLocalizedPath(targetPath, activeLocale));
      }
    }

    return;
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: toLocalizedPath("/login", activeLocale),
      query: {
        redirect: to.fullPath,
      },
    });
  }

  const permission = resolveRoutePermission(
    normalizedPath,
    authStore.permissions,
  );

  if (!permission.isMapped) {
    console.warn(
      `[auth.middleware] Unmapped route allowed by default: "${normalizedPath}"`,
    );
    return;
  }

  if (permission.allowed) {
    return;
  }

  const firstAllowedPath = getFirstAllowedPath(authStore.permissions);

  if (firstAllowedPath && firstAllowedPath !== normalizedPath) {
    return navigateTo(toLocalizedPath(firstAllowedPath, activeLocale));
  }

  // Fail-open to avoid redirect loops when permission data is empty or invalid.
  console.warn(
    `[auth.middleware] No allowed route found for permission redirect. ` +
      `Allowing current path "${normalizedPath}" to prevent loop.`,
  );
});
