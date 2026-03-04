import { uploadRegisterLogo } from "../../utils/register-backend";

export default defineEventHandler(async (event) => {
  return await uploadRegisterLogo(event);
});
