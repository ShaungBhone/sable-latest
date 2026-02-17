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
    id: "MODULE_TODO_LIST",
    title: "Todo List",
    link: "/todo-list",
  },
  {
    id: "MODULE_CUSTOMER_LIST",
    title: "Customer List",
    link: "/customer-list",
    subItems: [
      {
        id: "MODULE_CUSTOMER_360",
        title: "Customer 360",
        link: "/customer-360",
      },
    ],
  },
  {
    id: "MODULE_SEGMENT",
    title: "Segment",
    link: "/segment",
    subItems: [
      {
        id: "MODULE_SEGMENT",
        title: "Segment",
        link: "/segment",
      },
      {
        id: "MODULE_AUDIENCE",
        title: "Facebook Audience",
        link: "/segment/facebookAudience",
      },
    ],
  },
  {
    id: "MODULE_PRODUCT",
    title: "Product",
    link: "/product",
  },
  {
    id: "MODULE_CAMPAIGN",
    title: "Campaign",
    link: "/campaign",
    subItems: [
      {
        id: "MODULE_CAMPAIGN",
        title: "Campaign",
        link: "/campaign",
      },
      {
        id: "MODULE_SHORTLINK",
        title: "Shortlink",
        link: "/shortlink",
      },
      {
        id: "MODULE_FACEBOOK_ADS",
        title: "Facebook Ads",
        link: "/facebookAds",
      },
      {
        id: "MODULE_REWARD",
        title: "Reward",
        link: "/reward",
      },
    ],
  },
  {
    id: "MODULE_ONSITE_CAMPAIGN",
    title: "Onsite Campaign",
    link: "/onsite",
  },
  {
    id: "MODULE_AUTOMATE",
    title: "Automate",
    link: "/automate",
    subItems: [
      {
        id: "MODULE_AUTOMATE_NEW_WORKFLOW",
        title: "New Workflow",
        link: "/automate",
      },
      {
        id: "MODULE_JOURNEY_AUTOMATION",
        title: "Journey Automation",
        link: "/automate/journey",
      },
    ],
  },
  {
    id: "MODULE_AI_AGENT",
    title: "AI Agent",
    link: "/ai-chat",
    subItems: [
      {
        id: "MODULE_AI_AGENT",
        title: "AI Chat",
        link: "/ai-chat",
      },
    ],
  },
  {
    id: "MODULE_EXTENSION",
    title: "Extension",
    link: "/extension",
    subItems: [
      {
        id: "MODULE_EXTENSION",
        title: "Extension",
        link: "/extension",
      },
    ],
  },
  {
    id: "MODULE_COOKIE_CONSENT",
    title: "Cookie Consent",
    link: "/cookie-consent",
  },
  {
    id: "MODULE_BILLING",
    title: "Billing",
    link: "/bill-payment",
  },
  {
    id: "MODULE_SETTING",
    title: "Setting",
    link: "/setting",
  },
];
