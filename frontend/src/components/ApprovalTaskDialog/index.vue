<template>
  <el-dialog v-model="internalVisible" title="Actions Log" width="600px" append-to-body>
    <div v-loading="loading" class="block">
      <el-timeline v-if="tasks && tasks.length">
        <el-timeline-item v-for="item in tasks" :key="item.taskId" :timestamp="parseTime(item.operateTime, '{y}/{m}/{d} {h}:{i}')" placement="top">
          <el-card shadow="hover">
            <p class="mb-1">
              <span style="display: inline-block; width: 110px">Action Name:</span>
              <el-tag>
                {{ PlanningAndProtocolTaskNameLabel[Number(item.taskName)] || '-' }}
              </el-tag>
            </p>
            <p class="mb-1">
              <span style="display: inline-block; width: 110px">Operator:</span>
              <span>{{ item.assigneeName || item.assignee || '—' }}</span>
            </p>
            <p v-if="Number(item.commentsShowFlg) === 1" class="mb-1">
              <span style="display: inline-block; width: 110px">Comments:</span>
              <span>{{ item.comments }}</span>
            </p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="No Actions Log" />
    </div>
    <template #footer>
      <el-button @click="internalVisible = false">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { ApprovalTaskVO } from '@/api/demo/approvalTask/types';
import { PlanningAndProtocolTaskNameLabel } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';

const props = defineProps<{
  visible: boolean;
  loading: boolean;
  tasks: ApprovalTaskVO[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const internalVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
});

const loading = computed(() => props.loading);
const tasks = computed(() => props.tasks ?? []);
</script>
