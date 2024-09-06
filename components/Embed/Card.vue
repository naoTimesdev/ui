<template>
  <div
    :class="`relative flex flex-row items-start overflow-hidden rounded-md bg-white shadow-md dark:bg-zinc-800 ${borderColor}`"
  >
    <div class="relative mb-8 ml-3 mt-3 hidden w-24 flex-none sm:block">
      <NuxtImg :src="posterUrl" width="250" height="325" class="z-0 rounded-md" :alt="`Poster Proyek ${project.id}`" />
    </div>
    <div class="flex h-full max-w-full flex-grow flex-col px-3 py-8 pt-2 text-xs">
      <h1 class="mt-0.5 text-base font-semibold text-zinc-800 dark:text-zinc-100">
        {{ project.title }}
      </h1>
      <div>
        <EmbedEpisodeCard :progress="firstEpisode" :language="props.language" />
      </div>
      <template v-if="next3Episode.length > 0">
        <div
          class="grid grid-cols-2 justify-between"
          :class="{
            hidden: !dropdownOpen,
          }"
        >
          <EmbedEpisodeCard
            v-for="progress in next3Episode"
            :key="`card-${project.id}-ep-${progress.number}`"
            :progress="progress"
            :language="props.language"
          />
        </div>
        <button
          :class="cn('mt-2 flex flex-row items-center transition hover:opacity-80 focus:outline-none', buttonColor)"
          @click="dropdownOpen = !dropdownOpen"
        >
          <div class="size-5">
            <Icon v-if="dropdownOpen" name="i-radix-icons-chevron-up" class="-ml-1 size-5" />
            <Icon v-else name="i-radix-icons-chevron-down" class="-ml-1 size-5" />
          </div>
          <div class="text-left">
            {{
              dropdownOpen
                ? $t("embed.card.hideEpisodes", [], { locale: props.language })
                : $t("embed.card.showEpisodes", [next3Episode.length], { locale: props.language })
            }}
          </div>
        </button>
      </template>
    </div>
    <div>
      <div class="absolute bottom-2 left-3 text-xs text-zinc-400 dark:text-zinc-300">
        <div class="flex flex-row gap-1 text-left">
          <span v-if="firstEpisode.delayReason" class="group relative z-10 inline-block size-4 text-blue-400">
            <Icon name="i-heroicons-information-circle-solid" class="size-4 text-blue-400" />
            <span
              class="pointer-events-none absolute bottom-5 w-60 rounded rounded-bl-none border border-blue-400 bg-blue-100 px-2 py-2 text-blue-800 opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              {{ firstEpisode.delayReason }}
            </span>
          </span>
          <time :datetime="project.updated">{{
            $t("embed.card.lastUpdate", [formatUpdated], { locale: language })
          }}</time>
        </div>
      </div>
      <div
        class="absolute bottom-2 right-3 text-xs text-zinc-400 dark:text-zinc-300"
        :class="{
          invisible: !formattedSeason,
        }"
      >
        <div class="flex flex-row text-right">
          <span>{{ formattedSeason ?? "Unknown" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  project: ProjectLatestGQL;
  language: AvailableLocalesType;
  accent: ColorAccent;
}>();

const { t } = useI18n();
const { makeCdnUrl } = useServerUrl();

const dropdownOpen = ref(false);

const firstEpisode = computed(() => {
  return props.project.progress[0];
});

const next3Episode = computed(() => {
  return props.project.progress.slice(1, 4);
});

const borderColor = computed(() => {
  if (props.accent === "none") {
    return cn("border-none");
  }

  return cn(`rounded-t-none border-t-4 role-accent-${props.accent} border-t-[3px]`);
});

const buttonColor = computed(() => {
  if (dropdownOpen.value) {
    return cn("text-zinc-500 hover:text-zinc-400 dark:text-zinc-300");
  }

  return cn("text-blue-500 hover:text-blue-400 dark:text-blue-300");
});

const posterUrl = computed(() => {
  return makeCdnUrl(props.project.poster.image.url!);
});

const formattedSeason = computed(() => {
  const firstProgress = props.project.progress[0];

  if (firstProgress?.airDate) {
    const date = new Date(firstProgress.airDate);
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${getSeasonIcon(month)} ${getSeasonName(month, year)}`;
  }
});

const nowHeartbeat = useNow({
  interval: 30_000,
  controls: false,
});

const formatUpdated = computed(() => {
  const date = new Date(props.project.updated);

  return timeAgo(date, props.language, nowHeartbeat.value);
});

function getSeasonIcon(month: number) {
  if (month >= 0 && month <= 2) {
    return "❄️";
  }

  if (month >= 3 && month <= 5) {
    return "🌸";
  }

  if (month >= 6 && month <= 8) {
    return "☀️";
  }

  if (month >= 9 && month <= 11) {
    return "🍂";
  }

  if (month >= 12) {
    return "❄️";
  }
}

function getSeasonName(month: number, year: number): string {
  if (month >= 0 && month <= 2) {
    return t(
      "embed.card.seasonYear.winter",
      { year },
      {
        locale: props.language,
      }
    );
  }

  if (month >= 3 && month <= 5) {
    return t(
      "embed.card.seasonYear.spring",
      { year },
      {
        locale: props.language,
      }
    );
  }

  if (month >= 6 && month <= 8) {
    return t(
      "embed.card.seasonYear.summer",
      { year },
      {
        locale: props.language,
      }
    );
  }

  if (month >= 9 && month <= 11) {
    return t(
      "embed.card.seasonYear.fall",
      { year },
      {
        locale: props.language,
      }
    );
  }

  return t(
    "embed.card.seasonYear.winter",
    { year },
    {
      locale: props.language,
    }
  );
}
</script>
