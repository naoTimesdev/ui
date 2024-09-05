<template>
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <span class="w-full border-t" />
    </div>
    <div class="relative flex justify-center text-xs uppercase">
      <span class="font-variable bg-background px-2 text-muted-foreground variation-weight-semibold">
        <slot />
      </span>
    </div>
  </div>
</template>
