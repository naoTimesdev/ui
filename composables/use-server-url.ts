export const useServerUrl = () => {
  const runtimeConf = useRuntimeConfig();

  const originUrl = computed(() => {
    const apiUrl = runtimeConf.public.apiUrl;

    if (typeof apiUrl === "string" && apiUrl.trim().length > 0) {
      return apiUrl.replace(/\/$/, "");
    }

    return window.location.origin.replace(/\/$/, "");
  });

  const sameDomain = computed(() => {
    const origin = new URL(originUrl.value);

    return origin.hostname === window.location.hostname;
  });

  const makeUrl = (path: string) => {
    if (path.startsWith("http")) {
      return path;
    }

    // If the path is an absolute path, we need to prepend the origin
    if (path.startsWith("/")) {
      return `${originUrl.value}${path}`;
    }

    return `${originUrl.value}/${path}`;
  };

  const makeUrlPrivate = (path: string) => {
    if (!import.meta.server) {
      throw new Error("This function is only available on the server");
    }

    if (path.startsWith("http")) {
      return path;
    }

    const urlData = new URL(runtimeConf.apiPrivateUrl);

    urlData.pathname = path.startsWith("/") ? path : `/${path}`;

    return urlData.toString();
  };

  const makeCdnUrl = (path: string) => {
    const cdnUrl = runtimeConf.public.cdnUrl;

    if (path.startsWith("http")) {
      return path;
    }

    // If the path is an absolute path, we need to prepend the origin
    if (path.startsWith("/")) {
      return `${cdnUrl}${path}`;
    }

    return `${cdnUrl}/${path}`;
  };

  return {
    origin: originUrl,
    sameDomain,
    makeUrl,
    makeUrlPrivate,
    makeCdnUrl,
  };
};
