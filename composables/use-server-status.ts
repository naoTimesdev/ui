interface ServerResponse {
  success: boolean;
  version: string;
}

export const useServerStatus = () => {
  const serverUrl = useServerUrl();

  // Tri-state boolean: "on" | "off" | "unknown"
  const available = ref<"on" | "off" | "unknown">("unknown");
  const version = ref<string | null>(null);

  const pingServer = async () => {
    try {
      const response = await $fetch<ServerResponse>(serverUrl.origin.value);

      available.value = response.success ? "on" : "off";
      version.value = response.version;
    } catch {
      available.value = "off";
    }
  };

  // pingServer();

  return {
    available,
    version,
    pingServer,
  };
};
