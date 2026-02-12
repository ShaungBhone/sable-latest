import login from "./json/login.json";
import navUser from "./json/nav-user.json";

export default defineI18nLocale(async () => {
  return {
    ...login,
    ...navUser,
  };
});
