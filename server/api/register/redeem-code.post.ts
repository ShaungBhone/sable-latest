import { redeemRegisterCode } from "../../utils/register-backend";
import { createBadRequestError } from "../../utils/http-errors";

interface RedeemRequestBody {
  redeemCode?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RedeemRequestBody>(event);
  const redeemCode =
    typeof body?.redeemCode === "string" && body.redeemCode.trim().length > 0
      ? body.redeemCode.trim()
      : null;

  if (!redeemCode) {
    throw createBadRequestError("redeemCode is required.");
  }

  return await redeemRegisterCode(event, redeemCode);
});
