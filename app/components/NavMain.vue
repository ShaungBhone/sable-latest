<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";
import { ChevronRight, Lock } from "lucide-vue-next";
import { toast } from "vue-sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface NavMainSubItem {
  title: string;
  url: string;
  isActive?: boolean;
  isLocked?: boolean;
}

interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isLocked?: boolean;
  items?: NavMainSubItem[];
}

defineProps<{
  items: NavMainItem[];
}>();

const { t } = useI18n();

function onMenuClick(event: Event, isLocked?: boolean) {
  if (!isLocked) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  toast.error(t("navUser.permissionDenied"), {
    description: t("navUser.permissionDeniedDescription"),
    position: "bottom-center",
  });
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible
        v-for="item in items"
        :key="item.title"
        as-child
        :default-open="item.isActive"
        class="group/collapsible"
      >
        <SidebarMenuItem>
          <template v-if="item.items?.length">
            <CollapsibleTrigger
              as-child
              @click="(event) => onMenuClick(event, item.isLocked)"
            >
              <SidebarMenuButton :tooltip="item.title">
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  :class="{ 'opacity-70 blur-[1px]': item.isLocked }"
                />
                <span
                  class="truncate"
                  :class="{ 'opacity-70 blur-[1px]': item.isLocked }"
                >
                  {{ item.title }}
                </span>
                <Lock
                  v-if="item.isLocked"
                  class="text-muted-foreground ml-auto size-3.5"
                />
                <ChevronRight
                  class="ml-1 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="`${item.title}-${subItem.title}`"
                >
                  <SidebarMenuSubButton as-child>
                    <NuxtLink
                      :to="subItem.url"
                      @click="(event) => onMenuClick(event, subItem.isLocked)"
                    >
                      <span
                        :class="{ 'opacity-70 blur-[1px]': subItem.isLocked }"
                      >
                        {{ subItem.title }}
                      </span>
                      <Lock
                        v-if="subItem.isLocked"
                        class="text-muted-foreground ml-auto size-3.5"
                      />
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </template>

          <template v-else>
            <SidebarMenuButton as-child :tooltip="item.title">
              <NuxtLink
                :to="item.url"
                @click="(event) => onMenuClick(event, item.isLocked)"
              >
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  :class="{ 'opacity-70 blur-[1px]': item.isLocked }"
                />
                <span :class="{ 'opacity-70 blur-[1px]': item.isLocked }">
                  {{ item.title }}
                </span>
                <Lock
                  v-if="item.isLocked"
                  class="text-muted-foreground ml-auto size-3.5"
                />
              </NuxtLink>
            </SidebarMenuButton>
          </template>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
