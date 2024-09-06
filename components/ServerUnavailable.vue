<template>
  <div class="flex h-screen flex-col items-center justify-center px-2">
    <!-- Main "Screen" -->
    <div ref="mouseArea" class="absolute left-0 top-0 -z-10 h-screen w-screen overflow-hidden">
      <!-- This will follow mouse cursor -->
      <div ref="mouseTrail" class="absolute rounded-full bg-red-300 dark:bg-red-700" />
    </div>
    <div class="flex flex-col items-center justify-center">
      <Icon name="i-heroicons-server-stack" class="size-16 animate-pulse p-4" />
      <h1 class="font-variable mt-4 text-center text-3xl variation-weight-bold">
        {{ $t("app.unavailable.header") }}
      </h1>
      <p class="mt-1 text-center">
        {{ $t("app.unavailable.message") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const mouseArea = ref<HTMLElement | null>(null);
const mouseTrail = ref<HTMLElement | null>(null);
const { x, y } = useMouse({ touch: false });
const { pressed } = useMousePressed({
  touch: false,
  drag: false,
});

const unwatchMouseTrail = watch(
  [x, y],
  () => {
    if (mouseTrail.value) {
      // Set size, the more "center" the bigger
      // Range from 40px to 300px and bigger blur the more close to center
      // Drops are linear

      // Center is a boxed area
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const distanceX = Math.abs(centerX - x.value);
      const distanceY = Math.abs(centerY - y.value);

      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
      const currentDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      const size = 40 + (1 - currentDistance / maxDistance) * 260; // Size ranges from 40px to 300px

      const mouseX = x.value - size / 2;
      const mouseY = y.value - size / 2;

      mouseTrail.value.style.left = `${mouseX}px`;
      mouseTrail.value.style.top = `${mouseY}px`;

      mouseTrail.value.style.width = `${size}px`;
      mouseTrail.value.style.height = `${size}px`;

      const blurSize = Math.ceil(size / 3);

      mouseTrail.value.style.filter = `blur(${blurSize}px)`;
    }
  },
  {
    immediate: true,
  }
);

const unwatchMouseClick = watch(pressed, (mClick) => {
  console.log("Click", x.value, y.value);

  if (mClick && mouseArea.value) {
    const posX = x.value;
    const posY = y.value;

    const drop = document.createElement("div");

    drop.classList.add("absolute", "rounded-full", "bg-red-300", "dark:bg-red-700");

    const size = (40 + Math.random() * 60) * 2;

    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;

    drop.style.left = `${posX - size / 2}px`;
    drop.style.top = `${posY - size / 2}px`;

    drop.style.filter = `blur(${Math.ceil(size / 3)}px)`;

    mouseArea.value.appendChild(drop);

    // Add shrink animation
    drop.classList.add("animate-shrink");

    setTimeout(() => {
      drop.remove();
    }, 1600);
  }
});

onBeforeUnmount(() => {
  unwatchMouseTrail();
  unwatchMouseClick();
});
</script>

<style lang="postcss">
.animate-shrink {
  animation: shrink 1.5s forwards;
}

@keyframes shrink {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}
</style>
