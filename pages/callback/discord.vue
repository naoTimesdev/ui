<template>
  <div class="flex h-screen flex-col items-center justify-center px-2">
    <Icon
      name="i-simple-icons-discord"
      class="size-16 p-4"
      :class="{
        'animate-bounce': !errorMessage,
      }"
    />
    <h1 class="font-variable mt-2 text-center text-2xl variation-weight-bold lg:text-3xl">
      {{ errorMessage ? $t("auth.fails.loading") : $t("auth.loading") }}
    </h1>
    <p v-if="errorMessage" class="mt-1 text-center text-red-600 dark:text-red-400">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
const errorMessage = ref<string>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuth();

onMounted(async () => {
  const queryCode = route.query.code as string | undefined;
  const queryState = route.query.state as string | undefined;

  if (!queryCode || !queryState) {
    errorMessage.value = t("auth.fails.missing");

    return;
  }

  try {
    const results = await auth.login(queryCode, queryState);

    if (results) {
      await router.push("/dashboard");
    } else {
      errorMessage.value = t("auth.fails.general");
    }
  } catch (error) {
    if (error instanceof GraphQLSimpleError) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = t("auth.fails.general");
    }
  }
});

useHeadSafe({
  title: "Discord Callback",
  titleTemplate: "%s :: naoTimesUI",
});
</script>
