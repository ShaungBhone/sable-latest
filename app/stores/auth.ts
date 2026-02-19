import type { AuthMeResponse, AuthState } from "@/types/auth";

type FetchMeOptions = {
  force?: boolean;
  requestHeaders?: Record<string, string>;
};

interface BrandContextResponse {
  brandConfig: Record<string, unknown> | null;
  permissions: string[];
}

const BRAND_ID_STORAGE_KEY = "brandId";
const FALLBACK_PERMISSION = "MODULE_HOME";

function readStoredBrandId() {
  if (import.meta.server) {
    return null;
  }

  const value = localStorage.getItem(BRAND_ID_STORAGE_KEY);
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function persistBrandId(brandId: string | null) {
  if (import.meta.server) {
    return;
  }

  if (!brandId) {
    localStorage.removeItem(BRAND_ID_STORAGE_KEY);
    return;
  }

  localStorage.setItem(BRAND_ID_STORAGE_KEY, brandId);
}

function resolveSelectedBrandId(payload: AuthMeResponse) {
  const brandIds = new Set(payload.brands.map((brand) => brand.id));
  const storedBrandId = readStoredBrandId();
  const backendSelectedBrandId = payload.user.selectedBrandId;

  if (storedBrandId && brandIds.has(storedBrandId)) {
    return storedBrandId;
  }

  if (backendSelectedBrandId && brandIds.has(backendSelectedBrandId)) {
    return backendSelectedBrandId;
  }

  return payload.brands[0]?.id ?? null;
}

function normalizePermissions(
  permissions: string[] | null | undefined,
  fallback: string[] = [FALLBACK_PERMISSION],
) {
  const normalized = (Array.isArray(permissions) ? permissions : [])
    .map((permission) =>
      typeof permission === "string" ? permission.trim() : "",
    )
    .filter((permission) => permission.length > 0);

  const unique = Array.from(new Set(normalized));
  if (unique.length > 0) {
    return unique;
  }

  const normalizedFallback = (Array.isArray(fallback) ? fallback : [])
    .map((permission) =>
      typeof permission === "string" ? permission.trim() : "",
    )
    .filter((permission) => permission.length > 0);
  const fallbackUnique = Array.from(new Set(normalizedFallback));

  return fallbackUnique.length > 0 ? fallbackUnique : [FALLBACK_PERMISSION];
}

function extractPermissionsFromUnknown(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .map((permission) =>
      typeof permission === "string" ? permission.trim() : "",
    )
    .filter((permission) => permission.length > 0);

  return Array.from(new Set(normalized));
}

function extractPermissionsFromBrandConfig(
  brandConfig: Record<string, unknown> | null,
) {
  if (!brandConfig) {
    return [];
  }

  const visited = new Set<object>();

  const readDeep = (value: unknown): string[] => {
    if (!value || typeof value !== "object") {
      return [];
    }

    const record = value as Record<string, unknown>;
    if (visited.has(record)) {
      return [];
    }
    visited.add(record);

    const directPermissions = extractPermissionsFromUnknown(record.permissions);
    if (directPermissions.length > 0) {
      return directPermissions;
    }

    const permissionMenu = extractPermissionsFromUnknown(
      record.permission_menu,
    );
    if (permissionMenu.length > 0) {
      return permissionMenu;
    }

    for (const nestedValue of Object.values(record)) {
      const nestedPermissions = readDeep(nestedValue);
      if (nestedPermissions.length > 0) {
        return nestedPermissions;
      }
    }

    return [];
  };

  return readDeep(brandConfig);
}

let fetchMePromise: Promise<boolean> | null = null;

export const useAuthStore = defineStore("auth", {
  state: () =>
    ({
      status: "idle",
      user: null,
      brands: [],
      permissions: [],
      brandConfig: null,
      hydrated: false,
    }) as AuthState & {
      hydrated: boolean;
    },

  getters: {
    isAuthenticated: (state) => state.status === "authenticated",
    selectedBrand: (state) => {
      const selectedBrandId = state.user?.selectedBrandId;
      return (
        state.brands.find((brand) => brand.id === selectedBrandId) ??
        state.brands[0] ??
        null
      );
    },
  },

  actions: {
    applyAuthPayload(payload: AuthMeResponse) {
      const selectedBrandId = resolveSelectedBrandId(payload);
      const permissionsFromBrandConfig = extractPermissionsFromBrandConfig(
        payload.brandConfig,
      );

      this.status = "authenticated";
      this.user = {
        ...payload.user,
        selectedBrandId,
      };
      this.brands = payload.brands;
      this.permissions = normalizePermissions(
        payload.permissions,
        permissionsFromBrandConfig,
      );
      this.brandConfig = payload.brandConfig ?? null;
      this.hydrated = true;

      persistBrandId(selectedBrandId);
    },

    async refreshBrandContext(
      brandId: string | null,
      fallbackPermissions: string[] = [FALLBACK_PERMISSION],
      requestHeaders?: Record<string, string>,
    ) {
      if (!brandId) {
        this.brandConfig = null;
        this.permissions = normalizePermissions(fallbackPermissions);
        return;
      }

      try {
        const response = await $fetch<BrandContextResponse>(
          `/api/auth/brand-config/${encodeURIComponent(brandId)}`,
          {
            method: "GET",
            headers: requestHeaders,
            credentials: "include",
          },
        );

        this.brandConfig = response.brandConfig ?? null;
        const permissionsFromBrandConfig = extractPermissionsFromBrandConfig(
          response.brandConfig,
        );
        this.permissions = normalizePermissions(
          response.permissions,
          permissionsFromBrandConfig.length > 0
            ? permissionsFromBrandConfig
            : fallbackPermissions,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[auth] Failed to refresh brand context: ${message}`);
        this.permissions = normalizePermissions(fallbackPermissions);
      }
    },

    clear() {
      this.status = "unauthenticated";
      this.user = null;
      this.brands = [];
      this.permissions = [];
      this.brandConfig = null;
      this.hydrated = true;
    },

    async setSelectedBrandId(brandId: string | null) {
      if (!this.user) {
        return;
      }

      const previousBrandId = this.user.selectedBrandId;
      const nextBrandId = this.brands.some((brand) => brand.id === brandId)
        ? brandId
        : (this.brands[0]?.id ?? null);

      if (nextBrandId === previousBrandId && this.brandConfig) {
        persistBrandId(nextBrandId);
        return;
      }

      this.user = {
        ...this.user,
        selectedBrandId: nextBrandId,
      };

      persistBrandId(nextBrandId);
      await this.refreshBrandContext(nextBrandId, this.permissions);
    },

    async fetchMe(options: FetchMeOptions = {}) {
      const { force = false, requestHeaders } = options;

      if (!force && this.hydrated) {
        if (import.meta.client && this.isAuthenticated) {
          const storedBrandId = readStoredBrandId();
          if (storedBrandId && storedBrandId !== this.user?.selectedBrandId) {
            await this.setSelectedBrandId(storedBrandId);
          }
        }

        return this.isAuthenticated;
      }

      if (fetchMePromise) {
        return fetchMePromise;
      }

      this.status = "loading";

      fetchMePromise = (async () => {
        try {
          const response = await $fetch<AuthMeResponse>("/api/auth/me", {
            method: "GET",
            headers: requestHeaders,
            credentials: "include",
          });

          this.applyAuthPayload(response);
          await this.refreshBrandContext(
            this.user?.selectedBrandId ?? null,
            response.permissions,
            requestHeaders,
          );
          return true;
        } catch {
          this.clear();
          return false;
        } finally {
          fetchMePromise = null;
        }
      })();

      return fetchMePromise;
    },
  },
});
