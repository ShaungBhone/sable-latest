<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)">
    <FieldGroup>
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">Login to your account</h1>
        <p class="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <Field>
        <FieldLabel for="email"> {{ $t("login.emailLabel") }} </FieldLabel>
        <Input
          id="email"
          type="email"
          :placeholder="$t('login.emailPlaceholder')"
          required
        />
      </Field>
      <Field>
        <div class="flex items-center">
          <FieldLabel for="password">
            {{ $t("login.passwordLabel") }}
          </FieldLabel>
          <a
            href="#"
            class="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          :placeholder="$t('login.passwordPlaceholder')"
          required
        />
      </Field>
      <Field>
        <Button type="submit"> {{ $t("login.submitButton") }} </Button>
      </Field>
      <FieldSeparator>{{ $t("login.noAccount") }}</FieldSeparator>
      <Field>
        <Button variant="outline" type="button">
          {{ $t("login.signUp") }}
        </Button>
      </Field>
    </FieldGroup>
  </form>
</template>
