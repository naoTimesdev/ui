<template>
  <div class="font-rubik">
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
const defaultParams = {
  lang: "id",
  accent: "green",
  dark: "false",
};

const route = useRoute();
const { id, accent, dark, lang } = route.query;
const meili = useMeili();

const embedLang = ref("id");
const embedAccent = ref<ColorAccent>("green");

const getFirst = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value || "";
};

const mergedConfig = Object.assign({}, defaultParams, {
  lang: getFirst(lang),
  accent: getFirst(accent),
  dark: getFirst(dark),
});

const serverId = computed(() => {
  const srvId = getFirst(id);

  if (srvId && isDiscordSnowflake(srvId)) {
    console.log("Discord snowflake detected", srvId);

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
  const parseBigInt = Number.parseInt(value, 10);

  console.log("Parsing", parseBigInt);

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

    const results = await meili.searchServer({
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

    ogAPI.searchParams.set("name", server.name);
    ogAPI.searchParams.set("count", latestProjects.value.length.toString());
    ogAPI.searchParams.set("total", projectsData.value?.length.toString() ?? "0");

    const embedUrl = new URL(
      `https://panel.naoti.me/embed?id=${server.id}#lang=${mergedConfig.lang}&accent=${mergedConfig.accent}&dark=${mergedConfig.dark}`
    );

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
          content: `?name=${server.name}&count=34&total=34`,
        },
        {
          property: "og:url",
          content: embedUrl.toString(),
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

  if (lang && lang !== embedLang.value) {
    embedLang.value = lang;
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
  } else if (data.action === "setAccent") {
    if (ValidAccent.includes(data.target as ColorAccent)) {
      embedAccent.value = data.target as ColorAccent;
    }
  } else if (data.action === "setLanguage") {
    embedLang.value = data.target;
  }
}

onMounted(() => {
  dispatchNewHeight();

  window.addEventListener("hashchange", propagateHashChange);
  window.addEventListener("message", propagateEventChange);
});

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", propagateHashChange);
  window.removeEventListener("message", propagateEventChange);
});

useHeadSafe(getHeadInfo(serverData.value ?? undefined));
</script>

<style lang="postcss" scoped>
.font-rubik {
  font-family: "Rubik";
}
</style>
