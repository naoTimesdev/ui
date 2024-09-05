const useUserServers = defineStore("user-servers", () => {
  const router = useRouter();

  // State
  const activeServer = useLocalStorage<string | undefined>("naotimesui:active-servers", undefined, {
    initOnMounted: true,
  });

  // Actions

  /**
   * Activates a server by ID
   * @param serverId The server ID to set as active, if undefined, it will clear the active server
   * @returns The active server information
   */
  async function setActiveServer(serverId?: string) {
    activeServer.value = serverId;

    if (!serverId) {
      router.push("/dashboard");

      return;
    }

    // Then fetch the server data
  }

  return {
    activeServer,
    setActiveServer,
  };
});

export default useUserServers;
