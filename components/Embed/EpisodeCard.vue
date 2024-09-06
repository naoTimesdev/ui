<template>
  <div
    class="mt-2 flex text-sm text-gray-800 dark:text-gray-200"
    :class="{
      'flex-col': unfinishedStatus.length > 5,
      'flex-row': unfinishedStatus.length <= 5,
      'col-start-1 col-end-3': unfinishedStatus.length > 4,
    }"
  >
    <div>
      <div>
        <EmbedDelayReason v-if="progress.delayReason && !hideReason" class="mb-1 mr-1" smaller>
          {{ progress.delayReason }}
        </EmbedDelayReason>
        <span class="font-variable variation-weight-semibold">
          {{ localizeEpisodeNumber(progress.number, unfinishedStatus.length) }}
        </span>
      </div>

      <template v-if="episodeAired && anyProgress">
        <div v-if="unfinishedStatus.length > 0" class="mt-1 flex flex-wrap gap-1">
          <RolePopup
            v-for="role in unfinishedStatus"
            :key="`ep-${progress.number}-${role.role.key}`"
            class-text="font-variable variation-weight-medium"
            class-hover="font-variable variation-weight-semibold tracking-tighter"
            :title="role.role.key"
            :popup-text="localizeRole(role.role)"
          />
        </div>
        <div v-else class="mt-1 flex gap-1">
          <span class="font-variable text-lg variation-weight-light">
            {{ $t("embed.card.waitRelease", [], { locale: language }) }}
          </span>
        </div>
      </template>
      <template v-else-if="episodeAired && !anyProgress">
        <template v-if="formattedAirDate">
          <div>
            <time class="font-variable variation-weight-medium" :datetime="formattedAirDate.airDate">
              {{ $t("embed.card.aired", [formattedAirDate.text], { locale: language }) }}
            </time>
          </div>
          <div>
            <span class="font-variable variation-weight-[450]">{{
              $t("embed.card.noProgress", [], { locale: language })
            }}</span>
          </div>
        </template>
      </template>
      <div v-else>
        <div v-if="formattedAirDate">
          <time :datetime="formattedAirDate.airDate">
            {{ $t("embed.card.airing", [formattedAirDate.text], { locale: language }) }}
          </time>
        </div>
        <div>
          <span>{{ $t("embed.card.notAired", [], { locale: language }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  progress: ProjectLatestGQL["progress"][0];
  kind: ProjectLatestGQL["kind"];
  count: number;
  language: AvailableLocalesType;
  hideReason?: boolean;
}>();

const { t } = useI18n();

const nowHeartbeat = useNow({
  interval: 30_000,
  controls: false,
});

const unfinishedStatus = computed(() => {
  return props.progress.statuses.filter((status) => !status.finished);
});
const episodeAired = computed(() => {
  if (props.progress.airDate) {
    const currentTime = new Date();
    const airTime = new Date(props.progress.airDate);

    return currentTime > airTime;
  }

  // Always return true if there's no air date
  return true;
});
const anyProgress = computed(() => {
  return props.progress.statuses.length !== unfinishedStatus.value.length;
});
const formattedAirDate = computed(() => {
  if (props.progress.airDate) {
    const date = new Date(props.progress.airDate);

    return {
      text: timeAgo(date, props.language, nowHeartbeat.value),
      airDate: props.progress.airDate,
    };
  }
});

function localizeRole(role: ProjectLatestGQL["progress"][0]["statuses"][0]["role"]) {
  const transRole = t(`embed.card.roles.${role.key}`, [], {
    locale: props.language,
    fallbackWarn: false,
    missingWarn: false,
  });

  if (transRole === `embed.card.roles.${role.key}`) {
    return role.name;
  }

  return transRole;
}

function localizeEpisodeNumber(n: number, unfinishedCount: number) {
  switch (props.kind) {
    case "SERIES": {
      return t("embed.card.number.series", unfinishedCount, { locale: props.language, named: { n } });
    }
    case "MANGA": {
      return t("embed.card.number.manga", unfinishedCount, { locale: props.language, named: { n } });
    }
    case "MOVIES": {
      if (props.count > 1) {
        return t("embed.card.number.movies.plural", unfinishedCount, { locale: props.language, named: { n } });
      }

      return t("embed.card.number.movies.singular", unfinishedCount, { locale: props.language, named: { n } });
    }
    case "OVA": {
      if (props.count > 1) {
        return t("embed.card.number.ova.plural", unfinishedCount, { locale: props.language, named: { n } });
      }

      return t("embed.card.number.ova.singular", unfinishedCount, { locale: props.language, named: { n } });
    }
    case "BOOKS":
    case "LIGHT_NOVEL": {
      if (props.count > 1) {
        return t("embed.card.number.books.plural", unfinishedCount, { locale: props.language, named: { n } });
      }

      return t("embed.card.number.books.singular", unfinishedCount, { locale: props.language, named: { n } });
    }
    case "GAMES": {
      if (props.count > 1) {
        return t("embed.card.number.games.plural", unfinishedCount, { locale: props.language, named: { n } });
      }

      return t("embed.card.number.games.singular", unfinishedCount, { locale: props.language, named: { n } });
    }
    case "VISUAL_NOVEL": {
      if (props.count > 1) {
        return t("embed.card.number.vn.plural", unfinishedCount, {
          locale: props.language,
          named: { n },
        });
      }

      return t("embed.card.number.vn.singular", unfinishedCount, {
        locale: props.language,
        named: { n },
      });
    }
    case "UNKNOWN": {
      return t("embed.card.number.series", unfinishedCount, { locale: props.language, named: { n } });
    }
  }
}
</script>
