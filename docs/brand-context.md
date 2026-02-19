# Brand Context Guide

## Purpose

Brand selection affects:

- `selectedBrandId`
- `brandConfig`
- `permissions`

If `brand_id` is missing or out of sync, user access and data queries can break.

## Source Of Truth

### Selected brand

- Pinia: `authStore.user?.selectedBrandId`
- Local storage fallback: `localStorage["brandId"]`

### Brand permissions

- Primary source: `brandConfig.permission_menu` (or `brandConfig.permissions`)
- Fallback: API `permissions` response
- Final fallback: existing permissions / `MODULE_HOME`

## Current Flow

### 1. Initial auth load

- Client/server calls `/api/auth/me`
- `app/stores/auth.ts` sets user + brands
- Then `refreshBrandContext(selectedBrandId)` fetches brand config

### 2. Brand switch in sidebar

- `app/components/TeamSwitcher.vue` emits selected team id
- `app/components/AppSidebar.vue` binds with `v-model:selected-team-id`
- `authStore.setSelectedBrandId(...)` updates Pinia + local storage
- Then `authStore.refreshBrandContext(...)` refetches config/permissions

### 3. Browser refresh

- `app/plugins/auth-brand-sync.client.ts` runs `authStore.fetchMe()`
- `fetchMe()` reconciles local storage `brandId` with Pinia
- If needed, it re-applies selected brand and refreshes brand context

## Backend Endpoint Used

### Nuxt server proxy

- Route: `server/api/auth/brand-config/[brandId].get.ts`
- Calls backend using session token
- Returns:
  - `brandConfig`
  - `permissions`

### Backend config keys

From `nuxt.config.ts`:

- `auth.backendBrandConfigPath` (default: `/brand-config/:brandId`)
- `auth.backendBrandConfigMethod` (default: `GET`)

## Supported Backend Payload Shapes

`server/utils/backend-brand-config.ts` supports:

- `payload.brandConfig`
- `payload.brand_config`
- `payload.data.brandConfig`
- `payload.data.brand_config`
- direct config object as root

Permissions are read from:

- `permission_menu`
- `permissions`

## Pattern For Future API Requests

Always send `brand_id`.

```ts
const authStore = useAuthStore();

const brandId =
  authStore.user?.selectedBrandId ??
  (import.meta.client ? localStorage.getItem("brandId") : null);

if (!brandId) {
  throw new Error("Missing brand_id");
}

const params = {
  brand_id: brandId,
  // other params...
};
```

Use this pattern for endpoints like customer activity/details where brand scoping is required.
