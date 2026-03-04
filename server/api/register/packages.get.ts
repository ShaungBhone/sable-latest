import { fetchRegisterPackages } from "../../utils/register-backend";

export default defineEventHandler(async (event) => {
  const packages = await fetchRegisterPackages(event);

  return {
    packages,
  };
});
