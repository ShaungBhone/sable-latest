import { getRouterParam } from "h3";
import { verifyRegisterTransaction } from "../../../utils/register-backend";
import { createBadRequestError } from "../../../utils/http-errors";

export default defineEventHandler(async (event) => {
  const transactionId = getRouterParam(event, "transactionId");

  if (!transactionId) {
    throw createBadRequestError("Missing transactionId.");
  }

  return await verifyRegisterTransaction(event, transactionId);
});
