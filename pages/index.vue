<template>
  <div v-if="loading" class="grid grid-cols-1 grid-rows-1 lg:grid-cols-2">
    <div
      class="hidden h-screen flex-col justify-between border-r border-zinc-300 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 lg:flex"
    >
      <div class="flex flex-col p-8">
        <div class="flex flex-row items-center gap-2">
          <NuxtImg src="/assets/images/nt192.png" class="logo-nt-glow size-8 object-contain" />
          <h1 class="font-variable select-none text-2xl variation-weight-extrabold">
            <span class="font-variable variation-weight-normal">nao</span><span>Times</span>
          </h1>
        </div>
        <p class="font-variable mt-2 text-sm text-muted-foreground">
          {{ $t("app.tagline") }}
        </p>
      </div>
      <div class="flex flex-col p-8">
        <p class="font-variable text-sm text-muted-foreground">
          {{
            $t("app.footer", {
              year: romanizeNumber(currentYear),
            })
          }}
        </p>
        <div class="mt-0.5 flex">
          <NuxtLink
            to="https://github.com/naoTimesdev/ui"
            class="normal-link font-variable text-sm shadow-zinc-200 glow-text-md variation-weight-semibold"
          >
            {{ $t("app.source") }}
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="mx-auto flex h-screen flex-col justify-center p-8">
      <div class="flex flex-col items-center gap-2">
        <NuxtImg src="/assets/images/nt192.png" class="logo-nt-glow mb-4 block size-24 object-contain lg:hidden" />
        <h1 class="font-variable text-2xl variation-weight-semibold">
          {{ $t("login.header") }}
        </h1>
        <div class="mt-1 text-center text-sm text-muted-foreground md:max-w-[50%]">
          {{ $t("login.welcome") }}
        </div>
      </div>
      <div class="mt-4 flex w-full flex-col justify-center">
        <hr class="mx-auto mb-4 w-[60%] border-zinc-200 dark:border-zinc-700" />
        <UIButton :as="nuxtLink" :href="discordAuth" variant="outline" size="lg" class="mx-auto md:max-w-[50%]">
          <Icon name="i-simple-icons-discord" class="mr-3 h-6 w-6" />
          {{ $t("login.discord") }}
        </UIButton>
      </div>
      <hr class="mx-auto mt-4 w-[60%] border-zinc-200 dark:border-zinc-700" />
      <div class="mx-auto mt-4 flex w-full flex-row justify-center">
        <DarkToggle />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false);
const currentYear = computed(() => new Date().getFullYear());

const nuxtLink = resolveComponent("NuxtLink");
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { makeUrl } = useServerUrl();

const discordAuth = computed(() => {
  // Check redirect params for redirect URL
  const queryRedirect = route.query.redirect ?? localePath("/dashboard");

  const queryParams =
    (Array.isArray(queryRedirect) ? queryRedirect[0]?.toString() : queryRedirect) ?? localePath("/dashboard");

  const recorrectUrl = encodeURIComponent(decodeURIComponent(queryParams));

  return makeUrl(`/oauth2/discord/authorize?redirect_url=${recorrectUrl}`);
});

onMounted(() => {
  console.log("Checking user status...", route.query.redirect);

  // Check if user is already logged in
  if (route.query.redirect) {
    // Since it has redirect, it means checks fails and we need to login
    loading.value = true;

    return;
  }

  // Do check status
  console.log("Checking user status...");
  auth
    .getUser()
    .then((user) => {
      console.log("User status checked.", user);

      if (user) {
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        loading.value = true;
      }
    })
    .catch((err) => {
      console.error(err);

      loading.value = true;
    });
});
</script>

<style lang="postcss" scoped>
.logo-nt-glow {
  box-shadow: 0 0 15px #fadcca;
}
</style>
