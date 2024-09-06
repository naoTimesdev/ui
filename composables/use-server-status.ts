interface ServerResponse {
  success: boolean;
  version: string;
}

export const useServerStatus = () => {
  const serverUrl = useServerUrl();

  const version = ref<string | null>(null);

  const pingServer = async () => {
    try {
      const response = await $fetch<ServerResponse>(serverUrl.origin.value);

      version.value = response.version;

      return response.success;
    } catch {
      return false;
    }
  };

  return {
    version,
    pingServer,
  };
};
