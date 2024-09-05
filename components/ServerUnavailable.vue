<template>
  <div class="flex h-screen flex-col items-center justify-center">
    <Icon name="i-heroicons-server-stack" class="size-16 animate-pulse p-4" />
    <h1 class="font-variable mt-4 text-3xl variation-weight-bold">
      {{ $t("app.unavailable.header") }}
    </h1>
    <p class="mt-1">
      {{ $t("app.unavailable.message") }}
    </p>
  </div>
</template>

<script setup lang="ts">
const timeout = ref<number | NodeJS.Timeout>();
const retry = ref<number>(0);
const { pingServer } = useServerStatus();

function callback() {
  pingServer()
    .then(() => {
      clearTimeout(timeout.value);

      retry.value += 1;

      if (retry.value > 10) {
        // Reset retry
        retry.value = 0;
      }

      backoff();
    })
    .catch(() => {
      clearTimeout(timeout.value);
    });
}

function backoff() {
  if (timeout.value) {
    clearInterval(timeout.value);
  }

  // Backoff exponentially
  const backoff = Math.pow(2, retry.value);

  timeout.value = setTimeout(callback, 1000 * backoff);
}

onMounted(() => {
  // Wait 1s
  setTimeout(callback, 1000);
});

onBeforeUnmount(() => {
  clearTimeout(timeout.value);
});
</script>
