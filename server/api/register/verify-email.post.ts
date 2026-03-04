import { createBadRequestError } from "../../utils/http-errors";
import { sendRegisterVerificationEmail } from "../../utils/register-backend";

interface VerifyEmailRequestBody {
  email?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<VerifyEmailRequestBody>(event);
  const email =
    typeof body?.email === "string" && body.email.trim().length > 0
      ? body.email.trim()
      : null;

  if (!email) {
    throw createBadRequestError("email is required.");
  }

  return await sendRegisterVerificationEmail(event, email);
});
