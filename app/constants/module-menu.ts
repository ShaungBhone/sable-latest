import type { ModuleId } from "@/types/auth";

export interface ModuleMenuSubItem {
  id: ModuleId;
  title: string;
  link: string;
}

export interface ModuleMenuItem {
  id: ModuleId;
  title: string;
  link: string;
  subItems?: ModuleMenuSubItem[];
}

// Adapted from legacy backup/menu.js
export const moduleMenuItems: ModuleMenuItem[] = [
  {
    id: "MODULE_HOME",
    title: "Home",
    link: "/",
  },
  {
    id: "MODULE_EXTENSION",
    title: "Extension",
    link: "/",
  },
  {
    id: "MODULE_COOKIE_CONSENT",
    title: "Cookie Consent",
    link: "/",
  },
  {
    id: "MODULE_BILLING",
    title: "Billing",
    link: "/",
  },
  {
    id: "MODULE_SETTING",
    title: "Setting",
    link: "/",
  },
];
