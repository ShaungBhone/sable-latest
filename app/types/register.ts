export type SubscriptionPlan = "MONTHLY" | "ANNUAL";

export interface RegisterPriceOption {
  price: number | null;
  interval: string | null;
  discountType: string | null;
  discountValue: number;
}

export interface RegisterPackage {
  id: string;
  name: string;
  groupName: string;
  description: string;
  features: string[];
  monthly: RegisterPriceOption;
  annual: RegisterPriceOption;
  hasSibling: boolean;
}

export interface RegisterRedeemResponse {
  code: string;
  package: RegisterPackage | null;
  raw: unknown;
}

export interface RegisterPaymentSummary {
  oldPrice: number;
  discountPrice: number;
  totalPrice: number;
}

export interface RegisterCreateUserRequest {
  email: string;
  password: string;
  packageId?: string | null;
  subscriptionPlan?: SubscriptionPlan;
  redeemCode?: string | null;
}

export interface RegisterCreateUserResponse {
  paymentLink: string | null;
  raw: unknown;
}

export interface RegisterVerifyTransactionResponse {
  valid: boolean;
  email?: string | null;
  message?: string;
}

export interface RegisterUpdateUserInfoRequest {
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  brandLogoUrl: string;
  brandName: string;
  webUrl: string;
  webFormat: string;
  webMaintainer: string;
}
