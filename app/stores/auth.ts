import type { AuthMeResponse, AuthState } from "@/types/auth";

type FetchMeOptions = {
  force?: boolean;
};

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
      this.status = "authenticated";
      this.user = payload.user;
      this.brands = payload.brands;
      this.permissions = payload.permissions;
      this.brandConfig = payload.brandConfig;
      this.hydrated = true;
    },

    clear() {
      this.status = "unauthenticated";
      this.user = null;
      this.brands = [];
      this.permissions = [];
      this.brandConfig = null;
      this.hydrated = true;
    },

    async fetchMe(options: FetchMeOptions = {}) {
      const { force = false } = options;

      if (!force && this.hydrated) {
        return this.isAuthenticated;
      }

      if (fetchMePromise) {
        return fetchMePromise;
      }

      this.status = "loading";

      fetchMePromise = (async () => {
        try {
          const headers = import.meta.server
            ? useRequestHeaders(["cookie"])
            : undefined;
          const response = await $fetch<AuthMeResponse>("/api/auth/me", {
            method: "GET",
            headers,
            credentials: "include",
          });

          this.applyAuthPayload(response);
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
