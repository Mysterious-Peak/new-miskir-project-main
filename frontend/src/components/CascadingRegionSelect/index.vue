<template>
  <el-cascader
    v-model="selectedPath"
    :props="cascaderProps"
    placeholder="Select Region → Zone → Woreda → Kebele"
    clearable
    filterable
    style="width: 100%"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { CascaderProps } from 'element-plus';
import { listRegionByParent, getRegionPath } from '@/api/demo/region';
import type { SysPubRegionVO } from '@/api/demo/region/types';

const props = defineProps<{
  /** kebele code (leaf node) for pre-selection */
  kebeleCode?: string;
}>();

const emit = defineEmits<{
  (e: 'update:kebeleCode', val: string): void;
  (e: 'update:kebeleName', val: string): void;
  /** emits all selected codes and names for farmer form */
  (e: 'update:regionCode', val: string): void;
  (e: 'update:regionName', val: string): void;
  (e: 'update:zoneCode', val: string): void;
  (e: 'update:zoneName', val: string): void;
  (e: 'update:woredaCode', val: string): void;
  (e: 'update:woredaName', val: string): void;
}>();

const selectedPath = ref<string[]>([]);

const cascaderProps: CascaderProps = {
  lazy: true,
  lazyLoad: async (node, resolve) => {
    const parentCode = String(node.value || '#');
    try {
      const res: any = await listRegionByParent(parentCode);
      const list = res.data || [];
      const nodes = list
        .filter((item: SysPubRegionVO) => item.status === '1')
        .map((item: SysPubRegionVO) => ({
          value: item.code,
          label: item.name,
          leaf: item.grade === '5'
        }));
      resolve(nodes);
    } catch (e) {
      console.error('Failed to load children for', parentCode, e);
      resolve([]);
    }
  }
};

function onChange(values: string[]) {
  if (!values || values.length === 0) {
    emit('update:kebeleCode', '');
    emit('update:kebeleName', '');
    emit('update:regionCode', '');
    emit('update:regionName', '');
    emit('update:zoneCode', '');
    emit('update:zoneName', '');
    emit('update:woredaCode', '');
    emit('update:woredaName', '');
    return;
  }

  const lastVal = values[values.length - 1];
  emit('update:kebeleCode', lastVal);
  emit('update:kebeleName', ''); // name set by cascader display

  // Emit positional codes
  if (values.length >= 1) {
    emit('update:regionCode', values[0]);
  }
  if (values.length >= 2) {
    emit('update:zoneCode', values[1]);
  }
  if (values.length >= 3) {
    emit('update:woredaCode', values[2]);
  }
}

async function loadPath(code: string) {
  try {
    const res: any = await getRegionPath(code);
    const path = res.data || [];
    if (path.length > 0) {
      selectedPath.value = path;
    }
  } catch (e) {
    console.error('Failed to load region path for', code, e);
  }
}

onMounted(() => {
  if (props.kebeleCode) {
    loadPath(props.kebeleCode);
  }
});

watch(() => props.kebeleCode, (val) => {
  if (val) {
    loadPath(val);
  } else {
    selectedPath.value = [];
  }
});
</script>
