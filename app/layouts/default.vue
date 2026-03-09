<script lang="ts">
export const description = "An inset sidebar with secondary navigation.";
export const iframeHeight = "800px";
</script>

<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { moduleMenuItems } from "@/constants/module-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { matchesRoutePath, normalizeRoutePath } from "@/utils/permission-routing";

const route = useRoute();
const { locales } = useI18n();

const localeCodes = computed(() =>
  locales.value.map((locale) =>
    typeof locale === "string" ? locale : locale.code,
  ),
);

const breadcrumbs = computed(() => {
  const currentPath = normalizeRoutePath(route.path, localeCodes.value);

  for (const item of moduleMenuItems) {
    const matchedSubItem = item.subItems?.find((subItem) =>
      matchesRoutePath(currentPath, subItem.link),
    );

    if (matchedSubItem) {
      return [
        { title: item.title, link: item.link },
        { title: matchedSubItem.title },
      ];
    }

    if (matchesRoutePath(currentPath, item.link)) {
      return [{ title: item.title }];
    }
  }

  return [];
});
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <template v-if="breadcrumbs.length > 1">
                <BreadcrumbItem class="hidden md:block">
                  <BreadcrumbLink as-child>
                    <NuxtLink :to="breadcrumbs[0]?.link ?? '/'">
                      {{ breadcrumbs[0]?.title }}
                    </NuxtLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator class="hidden md:block" />
              </template>
              <BreadcrumbItem v-if="breadcrumbs.length">
                <BreadcrumbPage>
                  {{ breadcrumbs[breadcrumbs.length - 1]?.title }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div class="ml-auto px-4">
          <ClientOnly>
            <ThemeToggle />
          </ClientOnly>
        </div>
      </header>
      <div class="flex flex-1 flex-col p-4 pt-0">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
