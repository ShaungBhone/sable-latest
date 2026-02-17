<script setup lang="ts">
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Languages,
  LogOut,
} from "lucide-vue-next";
import { useFirebaseApp } from "vuefire";
import { toast } from "vue-sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}>();

const authStore = useAuthStore();
const { locale, locales, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();
const { isMobile } = useSidebar();
let firebaseAuthModule: typeof import("firebase/auth") | null = null;
let firebaseAuth: import("firebase/auth").Auth | null = null;

async function ensureFirebaseAuth() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  try {
    firebaseAuthModule ??= await import("firebase/auth");
    firebaseAuth = firebaseAuthModule.getAuth(useFirebaseApp());
    return firebaseAuth;
  } catch {
    return null;
  }
}

const localeOptions = computed(() =>
  locales.value.map((item) =>
    typeof item === "string"
      ? { code: item, name: item }
      : { code: item.code, name: item.name ?? item.code },
  ),
);

const availableLocales = computed(() =>
  localeOptions.value.filter((item) => item.code !== locale.value),
);
const isLoggingOut = ref(false);

watch(
  () => locale.value,
  (newLocale, oldLocale) => {
    if (!oldLocale || newLocale === oldLocale) return;

    const selectedLocale = localeOptions.value.find(
      (item) => item.code === newLocale,
    );
    const localeLabel = selectedLocale?.name ?? newLocale;

    toast(t("navUser.languagePreferenceUpdated"), {
      description: t("navUser.languageSetTo", { locale: localeLabel }),
      position: "bottom-center",
    });
  },
);

async function onLogout() {
  if (isLoggingOut.value) {
    return;
  }

  isLoggingOut.value = true;

  try {
    await $fetch("/api/auth/session", {
      method: "DELETE",
    });

    const authInstance = await ensureFirebaseAuth();

    if (authInstance && firebaseAuthModule) {
      await firebaseAuthModule.signOut(authInstance);
    }

    authStore.clear();

    toast.success(t("navUser.logoutSuccess"), {
      position: "bottom-center",
    });

    await navigateTo(localePath("/login"));
  } catch (error) {
    console.error("[auth] logout failed", error);
    toast.error(t("navUser.logoutError"), {
      description: t("navUser.logoutErrorDescription"),
      position: "bottom-center",
    });
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                {{ user.name.slice(0, 2).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg">
                  {{ user.name.slice(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <NuxtLink
              v-for="availableLocale in availableLocales"
              :key="availableLocale.code"
              :to="switchLocalePath(availableLocale.code)"
            >
              <DropdownMenuItem>
                <Languages />
                {{ availableLocale.name }}
              </DropdownMenuItem>
            </NuxtLink>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem :disabled="isLoggingOut" @select.prevent="onLogout">
            <LogOut />
            {{ isLoggingOut ? t("navUser.loggingOut") : t("navUser.logOut") }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
