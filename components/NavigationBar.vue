<template>
  <nav v-if="user" class="border-b">
    <div class="flex h-16 items-center justify-between px-4">
      <div class="flex flex-col">
        <h2 class="font-variable variation-weight-bold">
          <span class="font-variable variation-weight-normal">nao</span><span>Times</span>
        </h2>
      </div>
      <div class="flex flex-row items-center gap-2">
        <!-- Server selector -->
        <DarkToggle class="mr-2 !size-7" />
        <UIDropdownMenu>
          <UIDropdownMenuTrigger as-child>
            <UIAvatar>
              <UIAvatarImage :src="avatarUrl ?? ''" alt="Avatar URL" />
              <UIAvatarFallback>{{ userInitials }}</UIAvatarFallback>
            </UIAvatar>
          </UIDropdownMenuTrigger>
          <UIDropdownMenuContent class="w-56">
            <UIDropdownMenuLabel>
              <p class="font-variable leading-none variation-weight-semibold">{{ user.username }}</p>
            </UIDropdownMenuLabel>
            <UIDropdownMenuSeparator />
            <UIDropdownMenuGroup>
              <UIDropdownMenuItem :as="nuxtLink" href="/dashboard/profile">
                <span>Profile</span>
              </UIDropdownMenuItem>
              <UIDropdownMenuItem :as="nuxtLink" href="/dashboard/settings">
                <span>Settings</span>
              </UIDropdownMenuItem>
              <UIDropdownMenuItem :as="nuxtLink" href="/dashboard/new">
                <span>New Server</span>
              </UIDropdownMenuItem>
            </UIDropdownMenuGroup>
            <UIDropdownMenuSeparator />
            <UIDropdownMenuItem as="button" class="w-full cursor-pointer" @click="onLogout">
              <span>Log out</span>
            </UIDropdownMenuItem>
          </UIDropdownMenuContent>
        </UIDropdownMenu>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const servers = useUserServers();
const { user, logout } = useAuth();
const { makeCdnUrl } = useServerUrl();

const nuxtLink = resolveComponent("NuxtLink");

const avatarUrl = computed(() => {
  if (user?.avatar?.url) {
    return makeCdnUrl(user.avatar.url);
  }
});

const userInitials = computed(() => {
  if (user?.username) {
    return user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return "?";
});

function onLogout() {
  console.log("Logging out...");
  logout();
}
</script>
