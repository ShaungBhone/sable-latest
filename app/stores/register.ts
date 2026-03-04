import type {
  RegisterPackage,
  RegisterPaymentSummary,
  RegisterRedeemResponse,
  SubscriptionPlan,
} from "@/types/register";

interface RegisterState {
  email: string;
  password: string;
  selectedPackageId: string | null;
  subscriptionPlan: SubscriptionPlan;
  redeemCode: string | null;
  redeemDetails: RegisterRedeemResponse | null;
  packageList: RegisterPackage[];
  paymentSummary: RegisterPaymentSummary | null;
  onboardingEmail: string | null;
}

const STORAGE_KEY = "sable-register-flow";

function createDefaultState(): RegisterState {
  return {
    email: "",
    password: "",
    selectedPackageId: null,
    subscriptionPlan: "MONTHLY",
    redeemCode: null,
    redeemDetails: null,
    packageList: [],
    paymentSummary: null,
    onboardingEmail: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readPersistedState() {
  if (import.meta.server) {
    return createDefaultState();
  }

  try {
    const rawValue = sessionStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return createDefaultState();
    }

    const parsed = JSON.parse(rawValue);
    return isRecord(parsed)
      ? { ...createDefaultState(), ...parsed }
      : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

function calculateDiscountAmount(price: number, type: string | null, value: number) {
  if (!price || !type || !value) {
    return 0;
  }

  if (type === "PERCENTAGE") {
    return Math.round(price * (value / 100));
  }

  return Math.min(price, value);
}

export const useRegisterStore = defineStore("register", {
  state: (): RegisterState => readPersistedState(),

  getters: {
    selectedPackage: (state) =>
      state.packageList.find((item) => item.id === state.selectedPackageId) ??
      state.redeemDetails?.package ??
      null,
    hasRegistrationCredentials: (state) =>
      state.email.trim().length > 0 && state.password.trim().length > 0,
  },

  actions: {
    persist() {
      if (import.meta.server) {
        return;
      }

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          email: this.email,
          password: this.password,
          selectedPackageId: this.selectedPackageId,
          subscriptionPlan: this.subscriptionPlan,
          redeemCode: this.redeemCode,
          redeemDetails: this.redeemDetails,
          packageList: this.packageList,
          paymentSummary: this.paymentSummary,
          onboardingEmail: this.onboardingEmail,
        }),
      );
    },

    setCredentials(email: string, password: string) {
      this.email = email.trim();
      this.password = password;
      this.persist();
    },

    setPackageList(packageList: RegisterPackage[]) {
      this.packageList = packageList;

      if (!this.redeemDetails?.package && !this.selectedPackageId) {
        this.selectedPackageId = packageList[0]?.id ?? null;
      }

      this.recalculateSummary();
      this.persist();
    },

    setSubscriptionPlan(subscriptionPlan: SubscriptionPlan) {
      this.subscriptionPlan = subscriptionPlan;
      this.recalculateSummary();
      this.persist();
    },

    selectPackage(packageId: string | null) {
      this.selectedPackageId = packageId;

      if (packageId) {
        this.redeemCode = null;
        this.redeemDetails = null;
      }

      this.recalculateSummary();
      this.persist();
    },

    applyRedeemCode(result: RegisterRedeemResponse) {
      this.redeemCode = result.code;
      this.redeemDetails = result;
      this.selectedPackageId = result.package?.id ?? null;
      this.recalculateSummary();
      this.persist();
    },

    clearRedeemCode() {
      this.redeemCode = null;
      this.redeemDetails = null;
      this.recalculateSummary();
      this.persist();
    },

    setOnboardingEmail(email: string | null) {
      this.onboardingEmail = email?.trim() || null;
      this.persist();
    },

    recalculateSummary() {
      const selectedPackage = this.selectedPackage;

      if (!selectedPackage) {
        this.paymentSummary = null;
        return;
      }

      const pricing =
        this.subscriptionPlan === "ANNUAL"
          ? selectedPackage.annual.price
            ? selectedPackage.annual
            : selectedPackage.monthly
          : selectedPackage.monthly;
      const oldPrice = pricing.price ?? 0;
      const discountPrice = calculateDiscountAmount(
        oldPrice,
        pricing.discountType,
        pricing.discountValue,
      );

      this.paymentSummary = {
        oldPrice,
        discountPrice,
        totalPrice: Math.max(0, oldPrice - discountPrice),
      };
    },

    reset() {
      Object.assign(this, createDefaultState());

      if (import.meta.client) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    },
  },
});
