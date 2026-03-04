export type ModuleId = string;

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface AuthSessionInfo {
  uid: string;
  email: string | null;
  expiresAt: string;
}

export interface AuthUserInfo {
  id: string;
  email: string | null;
  displayName: string | null;
  companyId: string | null;
  selectedBrandId: string | null;
}

export interface AuthBrandInfo {
  id: string;
  name: string;
  plan: string | null;
}

export interface AuthMeResponse {
  session: AuthSessionInfo;
  user: AuthUserInfo;
  brands: AuthBrandInfo[];
  brandConfig: Record<string, unknown> | null;
  permissions: ModuleId[];
}

export type AuthSessionCreateResponse =
  | { ok: true; state: "authenticated"; expiresAt: string }
  | { ok: true; state: "onboarding_required"; expiresAt: string };

export interface OnboardingMeResponse {
  authenticated: true;
  email: string | null;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthMeResponse["user"] | null;
  brands: AuthBrandInfo[];
  permissions: ModuleId[];
  brandConfig: Record<string, unknown> | null;
}
