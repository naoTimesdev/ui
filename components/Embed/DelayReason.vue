<template>
  <span class="group relative z-10 inline-block size-4 align-middle text-blue-400">
    <Icon name="i-heroicons-information-circle-solid" class="size-4 text-blue-400" />
    <span
      class="role-bg-blue font-variable pointer-events-none absolute bottom-5 rounded rounded-bl-none border px-2 py-2 align-middle opacity-0 shadow transition-opacity variation-weight-medium group-hover:opacity-100"
      :class="{
        'min-w-60': !smaller,
        'min-w-28': smaller,
      }"
    >
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  smaller?: boolean;
}>();
</script>
