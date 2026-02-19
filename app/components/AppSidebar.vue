<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";
import type { SidebarProps } from "@/components/ui/sidebar";
import {
  Bot,
  Briefcase,
  ChartNoAxesCombined,
  CircleUserRound,
  ClipboardList,
  Cookie,
  CreditCard,
  GalleryVerticalEnd,
  LayoutDashboard,
  Megaphone,
  Puzzle,
  Settings,
  ShoppingBag,
  Users,
  Workflow,
} from "lucide-vue-next";
import NavMain from "@/components/NavMain.vue";
import NavProjects from "@/components/NavProjects.vue";
import NavUser from "@/components/NavUser.vue";
import TeamSwitcher from "@/components/TeamSwitcher.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { moduleMenuItems } from "@/constants/module-menu";
import { useAuthStore } from "@/stores/auth";
import {
  hasModulePermission,
  matchesRoutePath,
  normalizeRoutePath,
} from "@/utils/permission-routing";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const authStore = useAuthStore();
const route = useRoute();
const { locales } = useI18n();

const localeCodes = computed(() =>
  locales.value.map((locale) =>
    typeof locale === "string" ? locale : locale.code,
  ),
);

const normalizedCurrentPath = computed(() =>
  normalizeRoutePath(route.path, localeCodes.value),
);

const iconByModule: Record<string, LucideIcon> = {
  MODULE_HOME: LayoutDashboard,
  MODULE_TODO_LIST: ClipboardList,
  MODULE_CUSTOMER_LIST: Users,
  MODULE_CUSTOMER_360: CircleUserRound,
  MODULE_SEGMENT: ChartNoAxesCombined,
  MODULE_AUDIENCE: ChartNoAxesCombined,
  MODULE_PRODUCT: ShoppingBag,
  MODULE_CAMPAIGN: Megaphone,
  MODULE_SHORTLINK: Megaphone,
  MODULE_FACEBOOK_ADS: Megaphone,
  MODULE_REWARD: Megaphone,
  MODULE_ONSITE_CAMPAIGN: Megaphone,
  MODULE_AUTOMATE: Workflow,
  MODULE_AUTOMATE_NEW_WORKFLOW: Workflow,
  MODULE_JOURNEY_AUTOMATION: Workflow,
  MODULE_AI_AGENT: Bot,
  MODULE_EXTENSION: Puzzle,
  MODULE_COOKIE_CONSENT: Cookie,
  MODULE_BILLING: CreditCard,
  MODULE_SETTING: Settings,
};

const navMain = computed(() =>
  moduleMenuItems
    .filter((item) => !["MODULE_BILLING", "MODULE_SETTING"].includes(item.id))
    .map((item) => {
      const subItems =
        item.subItems?.map((subItem) => ({
          title: subItem.title,
          url: subItem.link,
          isActive: matchesRoutePath(normalizedCurrentPath.value, subItem.link),
          isLocked: !hasModulePermission(authStore.permissions, subItem.id),
        })) ?? [];

      const isActive =
        matchesRoutePath(normalizedCurrentPath.value, item.link) ||
        subItems.some((subItem) => subItem.isActive);

      return {
        title: item.title,
        url: item.link,
        icon: iconByModule[item.id] ?? Briefcase,
        isActive,
        isLocked: !hasModulePermission(authStore.permissions, item.id),
        items: subItems.length > 0 ? subItems : undefined,
      };
    }),
);

const selectedTeamId = computed({
  get: () => authStore.user?.selectedBrandId ?? authStore.brands[0]?.id ?? null,
  set: (brandId: string | null) => {
    authStore.setSelectedBrandId(brandId);
  },
});

const data = computed(() => ({
  user: {
    name: authStore.user?.displayName || authStore.user?.email || "User",
    email: authStore.user?.email || "",
    avatar: "",
  },
  teams: authStore.brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    logo: GalleryVerticalEnd,
    plan: brand.plan ?? "Workspace",
  })),
  projects: [
    {
      name: "Product Roadmap",
      url: "#",
      icon: Briefcase,
    },
  ],
}));
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher
        v-model:selected-team-id="selectedTeamId"
        :teams="data.teams"
      />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
