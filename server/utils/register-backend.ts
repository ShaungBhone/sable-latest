import { createError, type H3Event } from "h3";
import { readMultipartFormData } from "h3";
import { $fetch } from "ofetch";
import type {
  RegisterCreateUserRequest,
  RegisterCreateUserResponse,
  RegisterPackage,
  RegisterRedeemResponse,
  RegisterUpdateUserInfoRequest,
  RegisterVerifyTransactionResponse,
} from "@/types/register";
import {
  buildBackendUrl,
  createErrorFromUpstream,
  fetchBackend,
  interpolatePath,
} from "./backend-http";

const DEFAULT_PACKAGE_LIST_PATH = "/package-cdp";
const DEFAULT_EMAIL_CHECKER_PATH = "/register/email-checker";
const DEFAULT_REDEEM_CODE_PATH = "/redeem-code/detail";
const DEFAULT_REGISTER_CREATE_USER_PATH = "/register/user/app";
const DEFAULT_REGISTER_VERIFY_TRANSACTION_PATH =
  "/register/user/verify/:transactionId";
const DEFAULT_REGISTER_GENERATE_TOKEN_PATH =
  "/register/user/app/generate-token";
const DEFAULT_REGISTER_UPLOAD_LOGO_PATH = "/register/user/app/upload-logo";
const DEFAULT_REGISTER_UPDATE_USER_INFO_PATH =
  "/register/user/app/update-user-info";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePackageListItem(
  value: unknown,
  index: number,
): RegisterPackage | null {
  if (!isRecord(value)) {
    return null;
  }

  const monthly = isRecord(value.monthly) ? value.monthly : {};
  const annual = isRecord(value.annual) ? value.annual : {};
  const id = readString(value._id) ?? readString(value.id) ?? `package-${index}`;
  const features = Array.isArray(value.features)
    ? value.features.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id,
    name: readString(value.name) ?? readString(value.group_name) ?? id,
    groupName: readString(value.group_name) ?? readString(value.name) ?? id,
    description: readString(value.description) ?? "",
    features,
    monthly: {
      price: readNumber(monthly.monthly_price) ?? 0,
      interval: readString(monthly.monthly_interval) ?? "month",
      discountType: readString(monthly.monthly_discount_type),
      discountValue: readNumber(monthly.monthly_discount) ?? 0,
    },
    annual: {
      price: readNumber(annual.annual_price),
      interval: readString(annual.annual_interval) ?? "year",
      discountType: readString(annual.annual_discount_type),
      discountValue: readNumber(annual.annual_discount) ?? 0,
    },
    hasSibling: Boolean(value.have_sibling),
  };
}

function normalizePackageList(payload: unknown) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item, index) => normalizePackageListItem(item, index))
    .filter((item): item is RegisterPackage => Boolean(item));
}

function normalizeRedeemResponse(payload: unknown): RegisterRedeemResponse {
  const root = isRecord(payload) ? payload : {};
  const nested = isRecord(root.data) ? root.data : root;
  const packageData = isRecord(nested.package_data) ? nested.package_data : {};

  return {
    code:
      readString(nested.redeem_code) ??
      (Array.isArray(nested.redeem_code) ? readString(nested.redeem_code[0]) : null) ??
      "",
    package: normalizePackageListItem(packageData, 0),
    raw: payload,
  };
}

function normalizeCreateUserResponse(
  payload: unknown,
): RegisterCreateUserResponse {
  const root = isRecord(payload) ? payload : {};
  const nested = isRecord(root.data) ? root.data : root;
  const paymentLink =
    readString(nested.payment_link) ?? readString(root.payment_link) ?? null;

  return {
    paymentLink,
    raw: payload,
  };
}

export function normalizeVerifyTransactionResponse(
  payload: unknown,
  fallbackValid = true,
): RegisterVerifyTransactionResponse {
  const root = isRecord(payload) ? payload : {};
  const nested = isRecord(root.data) ? root.data : root;

  return {
    valid:
      typeof nested.valid === "boolean"
        ? nested.valid
        : typeof root.valid === "boolean"
          ? root.valid
          : fallbackValid,
    email: readString(nested.email) ?? readString(root.email),
    message:
      readString(nested.message) ?? readString(root.message) ?? undefined,
  };
}

export async function fetchRegisterPackages(event: H3Event) {
  const response = await fetchBackend<unknown>(
    event,
    DEFAULT_PACKAGE_LIST_PATH,
    {
      method: "GET",
      fallbackMessage: "Unable to load registration packages.",
      logPrefix: "[register] Failed to fetch packages",
    },
  );

  return normalizePackageList(response);
}

export async function checkRegisterEmail(event: H3Event, email: string) {
  await fetchBackend<unknown>(event, DEFAULT_EMAIL_CHECKER_PATH, {
    method: "GET",
    query: { email },
    fallbackMessage: "Unable to validate email.",
    logPrefix: "[register] Failed to validate email",
  });

  return { available: true };
}

export async function redeemRegisterCode(event: H3Event, redeemCode: string) {
  const response = await fetchBackend<unknown>(
    event,
    DEFAULT_REDEEM_CODE_PATH,
    {
      method: "POST",
      body: {
        redeem_codes: [redeemCode],
      },
      fallbackMessage: "Unable to validate redeem code.",
      logPrefix: "[register] Failed to validate redeem code",
    },
  );

  return normalizeRedeemResponse(response);
}

export async function createRegisterUser(
  event: H3Event,
  payload: RegisterCreateUserRequest,
) {
  const body = payload.redeemCode
    ? {
        email: payload.email,
        password: payload.password,
        redeem_code: payload.redeemCode,
      }
    : {
        email: payload.email,
        password: payload.password,
        package: {
          id: payload.packageId,
          subscription_plan: payload.subscriptionPlan,
        },
      };

  const response = await fetchBackend<unknown>(
    event,
    DEFAULT_REGISTER_CREATE_USER_PATH,
    {
      method: "POST",
      body,
      fallbackMessage: "Unable to create registration.",
      logPrefix: "[register] Failed to create user",
    },
  );

  return normalizeCreateUserResponse(response);
}

export async function verifyRegisterTransaction(
  event: H3Event,
  transactionId: string,
) {
  const path = interpolatePath(
    DEFAULT_REGISTER_VERIFY_TRANSACTION_PATH,
    "transactionId",
    transactionId,
  );
  const response = await fetchBackend<unknown>(event, path, {
    method: "PATCH",
    fallbackMessage: "Unable to validate registration transaction.",
    logPrefix: "[register] Failed to validate transaction",
  });

  return normalizeVerifyTransactionResponse(response, true);
}

export async function sendRegisterVerificationEmail(
  event: H3Event,
  email: string,
) {
  return await fetchBackend<unknown>(
    event,
    DEFAULT_REGISTER_GENERATE_TOKEN_PATH,
    {
      method: "POST",
      body: { email },
      fallbackMessage: "Unable to send verification email.",
      logPrefix: "[register] Failed to send verification email",
    },
  );
}

export async function uploadRegisterLogo(event: H3Event) {
  const config = useRuntimeConfig(event);
  const formEntries = await readMultipartFormData(event);

  if (!formEntries?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing upload payload.",
    });
  }

  const formData = new FormData();

  for (const entry of formEntries) {
    if (entry.filename && entry.data) {
      formData.append(
        entry.name,
        new Blob([entry.data], {
          type: entry.type || "application/octet-stream",
        }),
        entry.filename,
      );
    } else {
      formData.append(
        entry.name,
        typeof entry.data === "string" ? entry.data : new Blob([entry.data]),
      );
    }
  }

  try {
    const response = await $fetch<unknown>(
      buildBackendUrl(
        config.auth.backendBaseUrl,
        DEFAULT_REGISTER_UPLOAD_LOGO_PATH,
      ),
      {
        method: "POST",
        body: formData,
      },
    );

    const record = isRecord(response) ? response : {};
    const data = isRecord(record.data) ? record.data : {};

    return {
      imageUrl: readString(record.imageUrl) ?? readString(data.imageUrl),
      raw: response,
    };
  } catch (error) {
    throw createErrorFromUpstream(
      error,
      "Unable to upload brand logo.",
      "[register] Failed to upload logo",
    );
  }
}

export async function updateRegisterUserInfo(
  event: H3Event,
  idToken: string,
  payload: RegisterUpdateUserInfoRequest,
) {
  return await fetchBackend<unknown>(
    event,
    DEFAULT_REGISTER_UPDATE_USER_INFO_PATH,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "x-firebase-id-token": idToken,
      },
      body: payload,
      fallbackMessage: "Unable to complete onboarding.",
      logPrefix: "[register] Failed to update user info",
    },
  );
}
