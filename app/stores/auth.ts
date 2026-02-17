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
      permissions: [],
      brandConfig: null,
      session: null,
      hydrated: false,
    }) as AuthState & {
      session: AuthMeResponse["session"] | null;
      hydrated: boolean;
    },

  getters: {
    isAuthenticated: (state) => state.status === "authenticated",
  },

  actions: {
    applyAuthPayload(payload: AuthMeResponse) {
      this.status = "authenticated";
      this.user = payload.user;
      this.permissions = payload.permissions;
      this.brandConfig = payload.brandConfig;
      this.session = payload.session;
      this.hydrated = true;
    },

    clear() {
      this.status = "unauthenticated";
      this.user = null;
      this.permissions = [];
      this.brandConfig = null;
      this.session = null;
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
          const response = await $fetch<AuthMeResponse>("/api/auth/me", {
            method: "GET",
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
