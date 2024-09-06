<template>
  <div
    :class="
      cn('group relative inline-block cursor-default rounded border px-1 align-middle', computedColor, $props.class)
    "
  >
    <span :class="cn('align-middle', $props.classText)">{{ realTitle }}</span>
    <div
      :class="
        cn(
          'pointer-events-none absolute bottom-6 left-1/2 z-50 block -translate-x-1/2 transform whitespace-nowrap rounded-sm border px-2 py-1 text-center text-xs opacity-0 shadow transition-opacity focus:opacity-100 group-hover:opacity-100',
          computedColor
        )
      "
    >
      <span :class="cn('align-middle', $props.classHover)">{{ popupText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  popupText: string;
  overrideTitle?: string;
  class?: string;
  classText?: string;
  classHover?: string;
}>();

const realTitle = computed(() => {
  if (typeof props.overrideTitle === "string") {
    return props.overrideTitle;
  }

  return props.title;
});

const computedColor = computed(() => {
  return RoleColorPalette[props.title as keyof typeof RoleColorPalette] || RoleColorFallback;
});
</script>
