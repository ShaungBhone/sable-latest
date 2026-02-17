<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useForm } from "vee-validate";
import { useFirebaseApp } from "vuefire";
import { z } from "zod";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const authStore = useAuthStore();
const route = useRoute();
const localePath = useLocalePath();
const { t } = useI18n();
let firebaseAuth: ReturnType<typeof getAuth> | null = null;

try {
  firebaseAuth = getAuth(useFirebaseApp());
} catch {
  firebaseAuth = null;
}

const validationSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, t("login.emailRequired"))
      .email(t("login.emailInvalid")),
    password: z.string().min(1, t("login.passwordRequired")),
  }),
);

const {
  defineField,
  errors,
  handleSubmit,
  isSubmitting,
  setFieldError,
  setErrors,
} = useForm({
  validationSchema,
  initialValues: {
    email: "",
    password: "",
  },
});

const [email, emailProps] = defineField("email");
const [password, passwordProps] = defineField("password");

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return t("login.genericError");
  }

  const firebaseCode = (error as { code?: string }).code;

  if (
    firebaseCode === "auth/invalid-credential" ||
    firebaseCode === "auth/invalid-login-credentials" ||
    firebaseCode === "auth/wrong-password" ||
    firebaseCode === "auth/user-not-found"
  ) {
    return t("login.invalidCredentials");
  }

  return error.message || t("login.genericError");
}

function resolveRedirectTarget(rawValue: unknown) {
  if (typeof rawValue !== "string") {
    return localePath("/");
  }

  if (!rawValue.startsWith("/") || rawValue.startsWith("//")) {
    return localePath("/");
  }

  return rawValue;
}

const submit = handleSubmit(async (values) => {
  if (!firebaseAuth) {
    const message = t("login.authNotConfigured");
    setErrors({
      email: message,
      password: message,
    });
    toast.error(message);
    return;
  }

  try {
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      values.email,
      values.password,
    );
    const idToken = await credential.user.getIdToken(true);

    await $fetch("/api/auth/session", {
      method: "POST",
      body: {
        idToken,
      },
    });

    const hasSession = await authStore.fetchMe({ force: true });

    if (!hasSession) {
      throw new Error(t("login.genericError"));
    }

    toast.success(t("login.submitButton"), {
      description: t("login.successMessage"),
      position: "bottom-center",
    });

    await navigateTo(resolveRedirectTarget(route.query.redirect));
  } catch (error) {
    if (firebaseAuth) {
      await signOut(firebaseAuth).catch(() => undefined);
    }

    const errorMessage = getErrorMessage(error);
    setFieldError("password", errorMessage);
    toast.error(errorMessage, {
      position: "bottom-center",
    });
  }
});
</script>

<template>
  <form
    :class="cn('flex flex-col gap-6', props.class)"
    @submit.prevent="submit"
  >
    <FieldGroup>
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">{{ $t("login.title") }}</h1>
        <p class="text-muted-foreground text-sm text-balance">
          {{ $t("login.description") }}
        </p>
      </div>

      <Field :data-invalid="Boolean(errors.email)">
        <FieldLabel for="email">{{ $t("login.emailLabel") }}</FieldLabel>
        <Input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          :placeholder="$t('login.emailPlaceholder')"
          aria-required="true"
          :aria-invalid="Boolean(errors.email)"
          v-bind="emailProps"
        />
        <FieldError :errors="errors.email ? [errors.email] : []" />
      </Field>

      <Field :data-invalid="Boolean(errors.password)">
        <div class="flex items-center">
          <FieldLabel for="password">
            {{ $t("login.passwordLabel") }}
          </FieldLabel>
          <NuxtLink
            :to="localePath('/forgot-password')"
            class="ml-auto text-sm underline-offset-4 hover:underline"
          >
            {{ $t("login.forgotPassword") }}
          </NuxtLink>
        </div>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          :placeholder="$t('login.passwordPlaceholder')"
          aria-required="true"
          :aria-invalid="Boolean(errors.password)"
          v-bind="passwordProps"
        />
        <FieldError :errors="errors.password ? [errors.password] : []" />
      </Field>

      <Field>
        <Button type="submit" :disabled="isSubmitting">
          {{
            isSubmitting
              ? $t("login.loadingSubmitButton")
              : $t("login.submitButton")
          }}
        </Button>
      </Field>

      <FieldSeparator>{{ $t("login.noAccount") }}</FieldSeparator>

      <Field>
        <Button as-child variant="outline" type="button">
          <NuxtLink :to="localePath('/sign-up')">
            {{ $t("login.signUp") }}
          </NuxtLink>
        </Button>
      </Field>
    </FieldGroup>
  </form>
</template>
