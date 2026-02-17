import { moduleMenuItems } from "@/constants/module-menu";
import type { ModuleId } from "@/types/auth";

export interface ModuleRouteEntry {
  moduleId: ModuleId;
  path: string;
}

export interface RoutePermissionResult {
  moduleId: ModuleId | null;
  isMapped: boolean;
  allowed: boolean;
}

export const guestRoutes = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
] as const;

function canonicalPath(path: string) {
  if (!path) return "/";

  const withoutHash = path.split("#")[0] ?? "/";
  const withoutQuery = withoutHash.split("?")[0] ?? "/";
  let normalized = withoutQuery.trim();

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}

export function normalizeRoutePath(path: string, localeCodes: string[] = []) {
  const normalized = canonicalPath(path);
  const segments = normalized.split("/");
  const localeSegment = segments[1];

  if (localeSegment && localeCodes.includes(localeSegment)) {
    const withoutLocale = `/${segments.slice(2).join("/")}`;
    return canonicalPath(withoutLocale);
  }

  return normalized;
}

function collectRouteEntries() {
  const entries: ModuleRouteEntry[] = [];

  for (const item of moduleMenuItems) {
    entries.push({
      moduleId: item.id,
      path: canonicalPath(item.link),
    });

    for (const subItem of item.subItems ?? []) {
      entries.push({
        moduleId: subItem.id,
        path: canonicalPath(subItem.link),
      });
    }
  }

  // Keep order stable while deduping exact module->path pairs.
  const deduped = new Map<string, ModuleRouteEntry>();

  for (const entry of entries) {
    deduped.set(`${entry.moduleId}:${entry.path}`, entry);
  }

  return Array.from(deduped.values());
}

const orderedRouteEntries = collectRouteEntries();
const matchingRouteEntries = [...orderedRouteEntries].sort(
  (a, b) => b.path.length - a.path.length,
);

export function matchesRoutePath(currentPath: string, routePath: string) {
  const normalizedCurrent = canonicalPath(currentPath);
  const normalizedRoute = canonicalPath(routePath);

  if (normalizedRoute === "/") {
    return normalizedCurrent === "/";
  }

  if (normalizedCurrent === normalizedRoute) {
    return true;
  }

  return normalizedCurrent.startsWith(`${normalizedRoute}/`);
}

export function getMappedModuleId(path: string) {
  const normalized = canonicalPath(path);
  const matched = matchingRouteEntries.find((entry) =>
    matchesRoutePath(normalized, entry.path),
  );

  return matched?.moduleId ?? null;
}

export function hasModulePermission(
  permissions: ModuleId[],
  moduleId: ModuleId,
) {
  return permissions.includes("MODULE_ALL") || permissions.includes(moduleId);
}

export function resolveRoutePermission(path: string, permissions: ModuleId[]) {
  const moduleId = getMappedModuleId(path);

  if (!moduleId) {
    return {
      moduleId: null,
      isMapped: false,
      allowed: true,
    } satisfies RoutePermissionResult;
  }

  return {
    moduleId,
    isMapped: true,
    allowed: hasModulePermission(permissions, moduleId),
  } satisfies RoutePermissionResult;
}

export function getFirstAllowedPath(permissions: ModuleId[]) {
  const first = orderedRouteEntries.find((entry) =>
    hasModulePermission(permissions, entry.moduleId),
  );

  return first?.path ?? null;
}

export function isGuestRoute(path: string, localeCodes: string[] = []) {
  const normalized = normalizeRoutePath(path, localeCodes);
  return guestRoutes.includes(normalized as (typeof guestRoutes)[number]);
}
