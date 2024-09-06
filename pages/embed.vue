<template>
  <div class="font-embed-display tracking-tight">
    <div
      class="relative grid gap-2 bg-transparent px-1 pb-2 sm:grid-cols-2 sm:px-2 sm:py-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <EmbedErrorCard v-if="!serverData">
        {{ $t("embed.error.notFound") }}
      </EmbedErrorCard>
      <EmbedErrorCard v-else-if="serverData && (projectsData === undefined || projectsData === null)">
        {{ $t("embed.error.failedProjects") }}
      </EmbedErrorCard>
      <EmbedErrorCard v-else-if="latestProjects.length === 0">
        {{ $t("embed.error.noProjects") }}
      </EmbedErrorCard>
      <EmbedCard
        v-for="project in latestProjects"
        v-else-if="latestProjects.length > 0"
        :key="project.id"
        :project="project"
        :language="embedLang"
        :accent="embedAccent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationQueryValue } from "vue-router";

const defaultParams = {
  lang: "id",
  accent: "green",
  dark: "false",
};

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const { id, accent, dark, lang } = route.query;
const meili = useMeili();

const embedLang = ref<AvailableLocalesType>("id");
const embedAccent = ref<ColorAccent>("green");

const getFirst = (
  value: string | string[] | LocationQueryValue | LocationQueryValue[] | undefined
): string | undefined => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    return value[0] ?? undefined;
  }

  return value ?? "";
};

const mergedConfig = Object.assign({}, defaultParams, {
  lang: getFirst(lang) ?? defaultParams.lang,
  accent: getFirst(accent) ?? defaultParams.accent,
  dark: getFirst(dark) ?? defaultParams.dark,
});

const serverId = computed(() => {
  const srvId = getFirst(id);

  if (srvId && isDiscordSnowflake(srvId)) {
    return {
      id: srvId,
      kind: "discord",
    };
  }

  return {
    id: srvId,
    kind: "ulid",
  };
});

function isDiscordSnowflake(value: string): boolean {
  // Check if have alphabet
  if (value.match(/[a-zA-Z]/)) {
    return false;
  }

  const parseBigInt = Number.parseInt(value, 10);

  if (Number.isNaN(parseBigInt)) {
    return false;
  }

  const discordEpoch = 1420070400000;

  return parseBigInt > discordEpoch;
}

const { data: serverData } = await useAsyncData<SearchServer | undefined>(
  `embed-meili-${serverId.value.kind}-${serverId.value.id}`,
  async () => {
    const queryFilter =
      serverId.value.kind === "discord"
        ? `integrations.id = ${serverId.value.id} AND integrations.kind = DISCORD_GUILD`
        : `id = ${serverId.value.id}`;

    console.log("Querying meili", queryFilter, serverId.value);

    const results = await meili.searchServerPrivate({
      filter: queryFilter,
    });

    return results[0];
  },
  {
    server: true,
    lazy: false,
    immediate: true,
  }
);

const { data: projectsData } = await useAsyncData(
  `embed-meili-projects-v2-${serverId.value.kind}-${serverId.value.id}`,
  async () => {
    console.log("Querying server projects", serverData.value?.id);

    if (serverData.value?.id) {
      const results = await graphqlGetLatestProjectsInformation(serverData.value.id);

      if (Array.isArray(results)) {
        return results;
      }

      throw new Error("Failed to get projects");
    } else {
      throw new Error("Server not found");
    }
  },
  {
    server: true,
    lazy: false,
    immediate: true,
  }
);

const latestProjects = computed(() => {
  const projects = projectsData.value ?? [];

  // Include project with debt
  return projects.filter((project) => project.progress.length > 0);
});

function getHeadInfo(server?: SearchServer): Parameters<typeof useHeadSafe>[0] {
  if (server) {
    const ogAPI = new URL("https://og-api.naoti.me/large");

    const searchParams = new URLSearchParams();

    searchParams.set("name", server.name);
    searchParams.set("count", latestProjects.value.length.toString());
    searchParams.set("total", projectsData.value?.length.toString() ?? "0");

    ogAPI.search = searchParams.toString();

    const embedUrlBase = new URL(runtimeConfig.public.domainUrl);
    const embedSearch = new URLSearchParams();

    embedSearch.set("id", server.id);
    embedUrlBase.pathname = "/embed";
    embedUrlBase.search = embedSearch.toString();

    return {
      title: `Utang - ${server.name} :: naoTimesUI`,
      meta: [
        {
          name: "description",
          content: `Sebuah daftar utang untuk ${server.name}`,
        },
        {
          property: "og:title",
          content: `Utang - ${server.name}`,
        },
        {
          property: "og:description",
          content: `Sebuah daftar utang untuk ${server.name}`,
        },
        {
          property: "og:image",
          content: ogAPI.toString(),
        },
        {
          property: "og:url",
          content: embedUrlBase.toString(),
        },
        {
          property: "og:site_name",
          content: "naoTimesUI",
        },
        // twitter
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],
    };
  }

  return {
    title: "Tidak ditemukan :: naoTimesUI",
    meta: [
      {
        name: "description",
        content: "Server tidak ditemukan",
      },
    ],
  };
}

function dispatchNewHeight() {
  if (window.parent) {
    console.log("Dispatching new height");

    const height = document.body.scrollHeight;

    window.parent.postMessage(
      JSON.stringify({
        action: "resize",
        height,
      }),
      "*"
    );
  }
}

function propagateHashChange() {
  // get the hash
  const hash = window.location.hash;
  // strip out the # character
  const hashValue = hash.replace("#", "");
  // parse as query format
  const parsedHash = new URLSearchParams(hashValue);

  // apply changes
  const darkify = parsedHash.get("dark");

  if (darkify && castBooleanNull(darkify)) {
    window.document.documentElement.classList.add("dark");
  } else if (darkify && !castBooleanNull(darkify)) {
    window.document.documentElement.classList.remove("dark");
  }

  const accent = parsedHash.get("accent");
  const lang = parsedHash.get("lang");

  if (accent && accent !== embedAccent.value && ValidAccent.includes(accent as ColorAccent)) {
    embedAccent.value = accent as ColorAccent;
  }

  if (lang && lang !== embedLang.value && ValidLocales.includes(lang as AvailableLocalesType)) {
    embedLang.value = lang as AvailableLocalesType;
  }
}

function propagateEventChange(event: MessageEvent<string>) {
  if (!event.data) {
    return;
  }

  let data: {
    action: string;
    target: string;
  };

  try {
    data = JSON.parse(event.data);
  } catch {
    // console.error("embed.propagateEventChange: No data received");
    return;
  }

  const root = window.document.documentElement;

  if (data.action === "setDark") {
    const isDark = castBooleanNull(data.target);

    if (isDark) {
      if (!root.classList.contains("dark")) {
        root.classList.add("dark");
      }
    } else {
      if (root.classList.contains("dark")) {
        root.classList.remove("dark");
      }
    }
  } else if (data.action === "setAccent" && ValidAccent.includes(data.target as ColorAccent)) {
    embedAccent.value = data.target as ColorAccent;
  } else if (data.action === "setLanguage" && ValidLocales.includes(data.target as AvailableLocalesType)) {
    embedLang.value = data.target as AvailableLocalesType;
  }
}

onMounted(() => {
  const fromHash = new URLSearchParams(window.location.hash.replace("#", ""));
  const hashLang = fromHash.get("lang");
  const hasAccent = fromHash.get("accent");
  const hashDark = fromHash.get("dark");

  // Check dark mode
  const darkify = hashDark ? castBooleanNull(hashDark) : mergedConfig.dark || defaultParams.dark;

  if (darkify && castBooleanNull(darkify)) {
    window.document.documentElement.classList.add("dark");
  } else if (darkify && !castBooleanNull(darkify)) {
    window.document.documentElement.classList.remove("dark");
  }

  if (hasAccent && ValidAccent.includes(hasAccent as ColorAccent)) {
    embedAccent.value = hasAccent as ColorAccent;
  }

  if (hashLang && ValidLocales.includes(hashLang as AvailableLocalesType)) {
    embedLang.value = hashLang as AvailableLocalesType;
  }

  nextTick(() => {
    dispatchNewHeight();

    // Change router URL without reloading
    if (serverData.value) {
      router.replace({
        query: {
          id: serverData.value.id,
        },
        // Add hash
        hash: `#lang=${mergedConfig.lang}&accent=${mergedConfig.accent}&dark=${darkify}`,
      });
    }

    window.addEventListener("hashchange", propagateHashChange);
    window.addEventListener("message", propagateEventChange);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", propagateHashChange);
  window.removeEventListener("message", propagateEventChange);
});

useHeadSafe(getHeadInfo(serverData.value ?? undefined));
definePageMeta({
  colorMode: "light",
});
</script>

<style lang="postcss" scoped>
.font-embed-display {
  font-family: "Monaspace Xenon Var VF", "M PLUS 1 Code Var VF", "Monaspace Xenon", "M PLUS 1 Code";
}
</style>

<style lang="postcss">
body {
  @apply !bg-transparent;
}
</style>
