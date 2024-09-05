<template>
  <NuxtLoadingIndicator :color="colorMode.value === 'dark' ? '#fff' : '#000'" />
  <main class="font-monaspace-xenon font-variable min-h-screen min-w-[100vw]">
    <NuxtLayout v-if="available !== 'off'">
      <NuxtPage />
    </NuxtLayout>
    <ServerUnavailable v-else />
  </main>
</template>

<script setup lang="ts">
const { available, pingServer } = useServerStatus();
const colorMode = useColorMode();

onMounted(() => {
  pingServer();
});
</script>

