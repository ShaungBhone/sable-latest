import { getQuery } from "h3";
import { checkRegisterEmail } from "../../utils/register-backend";
import { createBadRequestError } from "../../utils/http-errors";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const email =
    typeof query.email === "string" && query.email.trim().length > 0
      ? query.email.trim()
      : null;

  if (!email) {
    throw createBadRequestError("email is required.");
  }

  return await checkRegisterEmail(event, email);
});
