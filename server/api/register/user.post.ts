import type { RegisterCreateUserRequest } from "@/types/register";
import { createRegisterUser } from "../../utils/register-backend";
import { createBadRequestError } from "../../utils/http-errors";

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterCreateUserRequest>(event);
  const email = body?.email?.trim();
  const password = body?.password?.trim();

  if (!email || !password) {
    throw createBadRequestError("email and password are required.");
  }

  if (!body.redeemCode && !body.packageId) {
    throw createBadRequestError("packageId or redeemCode is required.");
  }

  return await createRegisterUser(event, {
    email,
    password,
    packageId: body.packageId ?? null,
    subscriptionPlan: body.subscriptionPlan ?? "MONTHLY",
    redeemCode: body.redeemCode ?? null,
  });
});
