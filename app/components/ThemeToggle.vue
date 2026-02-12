<script setup lang="ts">
import { useHead } from "#imports";
import { computed } from "vue";
import { useColorMode, useStorage } from "@vueuse/core";
import { Monitor, Moon, Palette, Sun } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_MODES = ["light", "dark", "auto"] as const;
const THEME_PALETTES = ["sable", "violet", "orange"] as const;

type ThemeMode = (typeof THEME_MODES)[number];
type ThemePalette = (typeof THEME_PALETTES)[number];

const isOneOf = <T extends readonly string[]>(
  allowed: T,
  value: unknown,
): value is T[number] => {
  return typeof value === "string" && allowed.includes(value);
};

const colorMode = useColorMode<ThemeMode>({
  selector: "html",
  attribute: "class",
  emitAuto: true,
  storageKey: "sable-theme",
});

const palette = useStorage<ThemePalette>("sable-palette", "sable");

const setTheme = (value: unknown) => {
  if (isOneOf(THEME_MODES, value)) {
    colorMode.value = value;
  }
};

const setPalette = (value: unknown) => {
  if (isOneOf(THEME_PALETTES, value)) {
    palette.value = value;
  }
};

const colorModeModel = computed<ThemeMode>(() =>
  isOneOf(THEME_MODES, colorMode.value) ? colorMode.value : "auto",
);

useHead(() => ({
  htmlAttrs: {
    "data-theme": palette.value,
  },
}));
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="relative"
        aria-label="Toggle theme"
      >
        <Sun
          class="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
        />
        <Moon
          class="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
        />
        <Palette
          class="bg-background absolute right-0 bottom-0 size-3 rounded-full"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-44">
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        :modelValue="colorModeModel"
        @update:modelValue="setTheme"
      >
        <DropdownMenuRadioItem value="light">
          <Sun class="size-4" />
          <span>Light</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">
          <Moon class="size-4" />
          <span>Dark</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="auto">
          <Monitor class="size-4" />
          <span>System</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>

      <DropdownMenuSeparator />

      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        :modelValue="palette"
        @update:modelValue="setPalette"
      >
        <DropdownMenuRadioItem value="sable">
          <span class="size-3 rounded-full bg-cyan-500" />
          <span>Sable</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="violet">
          <span class="size-3 rounded-full bg-violet-500" />
          <span>Violet</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="orange">
          <span class="size-3 rounded-full bg-orange-500" />
          <span>Orange</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
