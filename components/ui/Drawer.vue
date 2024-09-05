<template>
  <Teleport>
    <div
      :class="{
        invisible: !isVisible,
        visible: isVisible,
      }"
    >
      <div
        class="fixed bottom-0 left-0 right-0 top-0 z-[200] w-full select-none bg-black transition-opacity"
        :class="{
          'opacity-50': isOpen,
          'opacity-0': !isOpen,
        }"
        :style="{
          transitionDuration: `${speed}ms`,
        }"
      />
      <div
        ref="contentTarget"
        :class="
          cn(
            'fixed bottom-0 top-0 z-[9999] flex h-full w-full flex-col overflow-auto transition-transform',
            location === 'right' ? 'right-0 translate-x-full' : 'left-0 -translate-x-full',
            open && 'translate-x-0',
            classContent
          )
        "
        :style="{
          transitionDuration: `${speed}ms`,
        }"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    location: "left" | "right";
    speed: number;
    classContent?: string;
    maxWidth?: string;
  }>(),
  {
    open: false,
    speed: 300,
    location: "left",
    maxWidth: "320px",
    classContent: "",
  }
);

const emits = defineEmits<{
  close: [];
}>();

const isVisible = ref(false);
const isTransition = ref(false);
const contentTarget = ref(null);

function toggleBackground(enable: boolean) {
  const body = document.body;

  body.style.overflow = enable ? "hidden" : "auto";
}

function closeDrawer() {
  if (!isTransition.value) {
    emits("close");
  }
}

watch(
  () => props.open,
  (value) => {
    isTransition.value = true;

    if (value) {
      toggleBackground(true);
      isVisible.value = true;
    } else {
      toggleBackground(false);
      setTimeout(() => {
        isVisible.value = false;
      }, props.speed);
    }

    setTimeout(() => {
      isTransition.value = false;
    }, props.speed);
  }
);

onMounted(() => {
  isVisible.value = props.open;
});

onClickOutside(contentTarget, () => {
  closeDrawer();
});
</script>
