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
      <span class="font-medium">
        {{
          episodeAired && anyProgress && unfinishedStatus.length > 0
            ? $t("embed.card.numberNeeds", [progress.number], { locale: language })
            : $t("embed.card.number", [progress.number], { locale: language })
        }}
      </span>
      <template v-if="episodeAired && anyProgress">
        <div v-if="unfinishedStatus.length > 0" class="mt-1 flex flex-wrap gap-1">
          <RolePopup
            v-for="role in unfinishedStatus"
            :key="`ep-${progress.number}-${role.role.key}`"
            :title="role.role.key"
            :popup-text="localizeRole(role.role)"
          />
        </div>
        <div v-else class="mt-1 flex gap-1">
          <span class="text-lg font-light">
            {{ $t("embed.card.waitRelease", [], { locale: language }) }}
          </span>
        </div>
      </template>
      <template v-else-if="episodeAired && !anyProgress">
        <template v-if="progress.airDate">
          <div>
            <time :datetime="progress.airDate">
              {{ progress.airDate }}
            </time>
          </div>
          <div>
            <span>{{ $t("embed.card.noProgress", [], { locale: language }) }}</span>
          </div>
        </template>
      </template>
      <div v-else>
        <div v-if="progress.airDate">
          <time :datetime="progress.airDate">
            {{ progress.airDate }}
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
  language: string;
}>();

const { t } = useI18n();

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

function localizeRole(role: ProjectLatestGQL["progress"][0]["statuses"][0]["role"]) {
  const transRole = t(`embed.card.roles.${role}`, [], { locale: props.language });

  if (transRole === `embed.card.roles.${role}`) {
    return role.name;
  }

  return transRole;
}
</script>
