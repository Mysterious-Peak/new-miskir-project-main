<template>
  <div class="flex flex-col gap-2 border-solid border-1 p-2 w-80">
    <span class="font-bold">{{ title }}</span>
    <div class="flex flex-row items-center gap-2">
      <el-icon><Guide /></el-icon>
      <span class="text-sm">{{ trip.summary.length.toFixed(trip.summary.length > 1000 ? 0 : 1) }}km</span>
      <el-icon><Clock /></el-icon>
      <span class="text-sm">{{ formatDuration(trip.summary.time) }}</span>
    </div>
    <el-button type="primary" @click="routeDetailShowFlag = !routeDetailShowFlag">显示/隐藏</el-button>
    <!-- <el-button type="primary" :icon="Compass" @click="" class="w-2" /> -->
    <div v-for="(leg, legIndex) in trip.legs" :key="legIndex" class="mt-2 mb-4" v-if="routeDetailShowFlag">
      <div v-for="(maneuver, maneuverIndex) in leg.maneuvers" :key="maneuverIndex" class="flex flex-col gap-2">
        <el-divider style="margin: 12px 0" />
        <span class="font-bold">{{ maneuver.instruction }}</span>
        <div v-if="maneuver.type !== 4 && maneuver.type !== 5 && maneuver.type !== 6" class="flex flex-row items-center gap-2">
          <el-icon><Guide /></el-icon>
          <span class="text-sm">{{ getLength(maneuver.length) }}</span>
          <el-icon><Clock /></el-icon>
          <span class="text-sm">{{ new Date(maneuver.time * 1000).toISOString().substr(11, 8) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getLength } from '@/map/common/common';
import { formatDuration } from '@/map/common/date-time';
import { propTypes } from '@/utils/propTypes';

const props = defineProps({
  title: propTypes.string,
  trip: propTypes.any
});

const routeDetailShowFlag = ref(false);
</script>
