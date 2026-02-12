# Theme System Guide

## Overview

This project uses a two-layer theme system:

1. `Appearance mode`: `light`, `dark`, or `system`
2. `Palette`: `sable`, `violet`, or `orange`

Both are controlled from `app/components/ThemeToggle.vue` and applied globally through CSS variables in `app/assets/css/global.css`.

## Files Involved

- `app/components/ThemeToggle.vue`
- `app/assets/css/global.css`
- `app/assets/css/tailwind.css`
- `app/layouts/guest.vue`
- `app/layouts/default.vue`

## How It Works

### 1. Appearance mode (`light/dark/system`)

`ThemeToggle.vue` uses `useColorMode` from VueUse:

- `storageKey`: `sable-theme`
- target element: `html`
- target attribute: `class`

This adds/removes `.dark` on the root HTML element.

### 2. Palette (`sable/violet/orange`)

`ThemeToggle.vue` uses `useStorage`:

- `storageKey`: `sable-palette`
- stored values: `sable`, `violet`, `orange`

The selected value is applied as:

- `html[data-theme="sable"]` (default)
- `html[data-theme="violet"]`
- `html[data-theme="orange"]`

### 3. Token application

`global.css` defines base tokens in:

- `:root` (light)
- `.dark` (dark)

Palette overrides are defined in:

- `:root[data-theme="violet"]`
- `.dark[data-theme="violet"]`
- `:root[data-theme="orange"]`
- `.dark[data-theme="orange"]`

These override tokens like `--primary`, `--accent`, `--ring`, and `--sidebar-*`.

### 4. Tailwind mapping

`app/assets/css/tailwind.css` maps CSS variables to Tailwind theme tokens using `@theme inline`, so classes like `bg-primary` and `text-foreground` always follow active theme + palette.

## Production SSR Note (`/login` 500)

To avoid SSR/runtime issues from browser-only theme behavior, the theme toggle is rendered client-side only:

- `app/layouts/guest.vue` uses `<ClientOnly><ThemeToggle /></ClientOnly>`
- `app/layouts/default.vue` uses `<ClientOnly><ThemeToggle /></ClientOnly>`

If you remove `ClientOnly`, SSR routes like `/login` can fail in production depending on runtime environment.

## Add a New Palette

1. Add palette value to `ThemePalette` and array in `ThemeToggle.vue`.
2. Add a new radio item in the Theme section of the dropdown.
3. Add CSS token override blocks in `global.css`:
   - `:root[data-theme="new-palette"]`
   - `.dark[data-theme="new-palette"]`
4. Keep token names identical (`--primary`, `--accent`, etc.).

## Troubleshooting

- Theme not changing:
  - Check localStorage keys: `sable-theme`, `sable-palette`
  - Check `<html>` has `class="dark"` and/or `data-theme="..."`
- Type red underlines in `ThemeToggle.vue`:
  - Ensure `@vueuse/core` imports exist for `useColorMode` and `useStorage`
  - Ensure `DropdownMenuRadioGroup` uses typed `modelValue` and `update:modelValue`
- Styles not updating:
  - Confirm `app/assets/css/global.css` is imported by `app/assets/css/tailwind.css`
