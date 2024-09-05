const INDEX_USERS = "nt-users";
const INDEX_SERVER = "nt-servers";
const INDEX_PROJECTS = "nt-projects";
const INDEX_COLLAB_SYNC = "nt-collab-sync";
const INDEX_COLLAB_INVITE = "nt-collab-invite";

export interface SearchIntegrations {
  id: UlidGQL;
  kind: string;
}

export interface SearchServer {
  id: UlidGQL;
  name: string;
  avatar_url: string;
  integrations: SearchIntegrations[];
  owners: UlidGQL[];
  created: number;
  updated: number;
}

export interface MeilisearchResult<T> {
  hits: T[];
  offset: number;
  limit: number;
  estimatedTotalHits: number;
  totalHits: number;
}

export const useMeili = () => {
  const runtimeConfig = useRuntimeConfig();

  const apiKey = computed(() => {
    if (import.meta.client) {
      return runtimeConfig.public.meiliKey;
    }

    return runtimeConfig.meiliPrivateKey;
  });

  const apiUrl = computed(() => {
    // Make readonly
    return new URL(runtimeConfig.public.meiliUrl);
  });

  async function searchServer(query: Record<string, unknown>) {
    const url = new URL(runtimeConfig.public.meiliUrl);

    url.pathname = `/indexes/${INDEX_SERVER}/search`;

    const body = {
      ...query,
      q: "",
    };

    try {
      const result = await fetch(url.toString(), {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.value}`,
        },
      });

      if (result.ok) {
        const json: MeilisearchResult<SearchServer> = await result.json();

        return json.hits;
      }

      return [];
    } catch (e) {
      console.error(e);

      return [];
    }
  }

  return {
    apiUrl: readonly(apiUrl),
    apiKey,
    searchServer,
  };
};
