<template>
  <NuxtLoadingIndicator :color="colorMode.value === 'dark' ? '#fff' : '#000'" />
  <main class="font-monaspace-xenon font-variable min-h-screen min-w-[100vw]">
    <NuxtLayout v-if="isReady === true">
      <NuxtPage />
    </NuxtLayout>
    <ServerUnavailable v-else-if="isReady === false" />
  </main>
</template>

<script setup lang="ts">
const { pingServer } = useServerStatus();
const colorMode = useColorMode();

const route = useRoute();
const timeout = ref<number | NodeJS.Timeout>();
const retry = ref<number>(0);
const isReady = ref<boolean | null>(route.path === "/embed" ? true : null);

function callback() {
  pingServer()
    .then((res) => {
      isReady.value = res;

      if (!res) {
        beforeBackoff();
      }
    })
    .catch(() => {
      beforeBackoff();
    });
}

function beforeBackoff() {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }

  retry.value += 1;

  if (retry.value > 10) {
    // Reset retry
    retry.value = 0;
  }

  backoff();
}

function backoff() {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }

  // Backoff exponentially
  const backoff = Math.pow(2, retry.value);

  timeout.value = setTimeout(callback, 1000 * backoff);
}

onMounted(() => {
  if (route.path !== "/embed") {
    callback();
  }
});

onBeforeUnmount(() => {
  if (timeout.value) {
    clearTimeout(timeout.value);
  }
});
</script>

