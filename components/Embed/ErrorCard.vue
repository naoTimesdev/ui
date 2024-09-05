<template>
  <div
    class="role-accent-red relative flex flex-row items-start overflow-hidden rounded-md rounded-t-none border-t-[3px] bg-zinc-100 shadow-md dark:bg-zinc-800"
  >
    <div className="h-full flex-grow px-3 pt-2 py-6 max-w-full flex flex-col text-center">
      <h1 className="font-light break-all text-xl mt-2 text-zinc-800 dark:text-zinc-100">
        <slot />
      </h1>
    </div>
  </div>
</template>
