<template>
  <div
    :class="`relative flex flex-row items-start overflow-hidden rounded-md bg-white shadow-md dark:bg-zinc-800 ${borderColor}`"
  >
    <div class="relative mb-8 ml-3 mt-3 hidden w-24 flex-none sm:block">
      <NuxtImg :src="posterUrl" width="250" height="325" class="z-0 rounded-md" :alt="`Poster Proyek ${project.id}`" />
    </div>
    <div class="flex h-full max-w-full flex-grow flex-col px-3 py-8 pt-2 text-xs">
      <h1
        class="font-variable mt-0.5 text-base tracking-tighter text-zinc-800 variation-weight-extrabold dark:text-zinc-100"
      >
        {{ project.title }}
      </h1>
      <div>
        <EmbedEpisodeCard
          :kind="project.kind"
          :count="project.count"
          :progress="firstEpisode"
          :language="props.language"
          hide-reason
        />
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
            :kind="project.kind"
            :count="project.count"
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
          <EmbedDelayReason v-if="firstEpisode.delayReason">
            {{ firstEpisode.delayReason }}
          </EmbedDelayReason>
          <time :datetime="project.updated" class="font-variable text-[0.7rem] tracking-tighter">
            {{ $t("embed.card.lastUpdate", [formatUpdated], { locale: language }) }}
          </time>
        </div>
      </div>
      <div
        class="absolute bottom-2 right-3 text-[0.7rem] text-zinc-400 dark:text-zinc-300"
        :class="{
          invisible: !formattedSeason,
        }"
      >
        <div class="inline text-right">
          <EmbedEmojiSeason v-if="formattedSeason" :season="formattedSeason.season" class="mb-0.5 mr-1 inline size-3" />
          <span v-if="formattedSeason" class="align-middle">
            {{ getSeasonName(formattedSeason.season, formattedSeason.year) }}
          </span>
          <span v-else>Unknown</span>
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
  if (props.project.startTime) {
    const date = new Date(props.project.startTime);
    const month = date.getMonth();
    const year = date.getFullYear();

    return {
      season: getSeason(month),
      year,
    };
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

function getSeason(month: number): "winter" | "spring" | "summer" | "fall" {
  if (month >= 0 && month <= 2) {
    return "winter";
  }

  if (month >= 3 && month <= 5) {
    return "spring";
  }

  if (month >= 6 && month <= 8) {
    return "summer";
  }

  if (month >= 9 && month <= 11) {
    return "fall";
  }

  return "winter";
}

function getSeasonName(month: "winter" | "spring" | "summer" | "fall", year: number): string {
  return t(
    `embed.card.seasonYear.${month}`,
    { year },
    {
      locale: props.language,
    }
  );
}
</script>
