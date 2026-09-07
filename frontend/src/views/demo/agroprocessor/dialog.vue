<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    width="1200px"
    append-to-body
    @update:model-value="onUpdateVisible"
    @opened="handleDialogOpened"
    @closed="handleDialogClosed"
  >
    <div class="dialog-content">
      <div class="form-panel">
        <el-form ref="innerFormRef" :model="form" :rules="rules" label-width="auto">
          <el-form-item label="Processor Name" prop="processorName">
            <el-input v-model="form.processorName" placeholder="Please input Processor Name" :disabled="isReadonlyMode" />
          </el-form-item>
          <el-form-item label="Processor Type" prop="processorType">
            <el-select v-model="form.processorType" placeholder="Please select Processor Type" :disabled="isReadonlyMode">
              <el-option v-for="dict in processorTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Registration Number" prop="registrationNumber">
            <el-input v-model="form.registrationNumber" placeholder="Please input Registration Number" :disabled="isReadonlyMode" />
          </el-form-item>
          <el-form-item label="Tin Number" prop="tinNumber">
            <el-input v-model="form.tinNumber" placeholder="Please input Tin Number" :disabled="isReadonlyMode" />
          </el-form-item>
          <el-form-item label="Ownership Type" prop="ownershipType">
            <el-select v-model="form.ownershipType" placeholder="Please select Ownership Type" :disabled="isReadonlyMode">
              <el-option v-for="dict in ownershipTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Region" prop="region">
            <el-select v-model="form.region" placeholder="Please select Region" :disabled="isReadonlyMode">
              <el-option v-for="dict in regionOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Zone" prop="zone">
            <el-input v-model="form.zone" placeholder="Please input Zone" :disabled="isReadonlyMode" />
          </el-form-item>
          <el-form-item label="Woreda" prop="woreda">
            <el-input v-model="form.woreda" placeholder="Please input Woreda" :disabled="isReadonlyMode" />
          </el-form-item>
          <el-form-item label="Latitude" prop="gpsLat">
            <el-input-number
              v-model="form.gpsLat"
              placeholder="Please input Latitude"
              :min="0"
              :max="90.0"
              style="width: 100%"
              :disabled="isReadonlyMode"
            />
          </el-form-item>
          <el-form-item label="Longitude" prop="gpsLong">
            <el-input-number
              v-model="form.gpsLong"
              placeholder="Please input Longitude"
              :min="0"
              :max="180.0"
              style="width: 100%"
              :disabled="isReadonlyMode"
            />
          </el-form-item>
          <el-form-item label="Designed capacity (kg/day)" prop="processingCapacityPerDay">
            <el-input-number
              v-model="form.processingCapacityPerDay"
              placeholder="Please input Designed capacity (kg/day)"
              :min="0"
              :max="99999999999999.9999"
              style="width: 100%"
              :disabled="isReadonlyMode"
            />
          </el-form-item>
          <el-form-item label="Technology Level" prop="technologyLevel">
            <el-select v-model="form.technologyLevel" placeholder="Please select Technology Level" :disabled="isReadonlyMode">
              <el-option v-for="dict in technologyLevelOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="showApprovedComment?.(form) || showApprovedCommentInput?.(form)" label="Approval Comment" prop="approvedComment">
            <el-input v-model="approvedCommentValue" type="textarea" placeholder="Please input content" :disabled="isApprovedCommentDisabled" />
          </el-form-item>
        </el-form>
      </div>
      <div class="map-panel">
        <div class="map-tip" v-if="!isReadonlyMode">Tip: click map to fill Latitude and Longitude.</div>
        <div ref="mapContainer" class="gps-map"></div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <!-- 只读模式：只显示 Close 按钮 -->
        <template v-if="modelValue && mode === 'readonly'">
          <el-button @click="handleCancel">Close</el-button>
        </template>
        <!-- 部分编辑模式和全部编辑模式：根据回调函数显示按钮 -->
        <template v-else-if="modelValue && (mode === 'partial-edit' || mode === 'all-edit' || mode === 'readonlyzzz')">
          <el-button v-if="showSaveButton && saveHandler" type="primary" :loading="buttonLoading" @click="saveHandler()"> Save </el-button>
          <template v-for="status in statusList" :key="status">
            <el-button
              v-if="statusButtonHandlers && statusButtonHandlers[status]"
              :type="getButtonType(status)"
              :loading="buttonLoading"
              @click="handleStatusClick(status)"
            >
              {{ status === AgroprocessorStatus.Submitted ? 'Submit' : AgroprocessorStatus[status] }}
            </el-button>
          </template>
          <el-button @click="handleCancel">{{ cancelButtonText }}</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus';
import type { AgroprocessorForm } from '@/api/demo/agroprocessor/types';
import { AgroprocessorStatus } from '@/enums/AgriculturalEnum';
import maplibregl, { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type DialogMode = 'readonly' | 'partial-edit' | 'all-edit' | 'readonlyzzz';

const props = withDefaults(
  defineProps<{
    /** 标题名称 */
    title: string;
    /** v-model:visible */
    modelValue: boolean;
    /** 表单数据（父组件传入） */
    form: AgroprocessorForm;
    /** 校验规则（父组件传入） */
    rules: any;
    /** 对话框模式：readonly-全部只读，partial-edit-部分编辑（只有ApprovedComment可编辑），all-edit-全部可编辑 */
    mode?: DialogMode;
    /** 是否展示审批意见（回调函数，参数是row） */
    showApprovedComment?: (row: AgroprocessorForm) => boolean;
    /** 是否显示审批意见输入框（回调函数，参数是row），如果返回true，则不显示原有数据，让用户输入 */
    showApprovedCommentInput?: (row: AgroprocessorForm) => boolean;
    /** Select 字典：所有权类型 */
    ownershipTypeOptions: any[];
    /** Select 字典：加工企业类型 */
    processorTypeOptions: any[];
    /** Select 字典：技术等级 */
    technologyLevelOptions: any[];
    /** Select 字典：区域 */
    regionOptions: any[];
    /** 底部按钮 loading 状态 */
    buttonLoading?: boolean;
    /** 是否显示 Save 按钮（仅在 partial-edit 和 all-edit 模式下有效） */
    showSaveButton?: boolean;
    /** Save 按钮回调（仅在 partial-edit 和 all-edit 模式下有效） */
    saveHandler?: () => void;
    /** 底部状态按钮显示顺序（从左到右），不配置则按枚举数值降序（仅在 partial-edit 和 all-edit 模式下有效） */
    statusOrder?: AgroprocessorStatus[];
    /** 各状态对应的回调（仅在 partial-edit 和 all-edit 模式下有效） */
    statusButtonHandlers?: Partial<Record<AgroprocessorStatus, () => void>>;
  }>(),
  {
    mode: 'readonly',
    showApprovedComment: () => true,
    buttonLoading: false,
    showSaveButton: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'cancel'): void;
}>();

// 解构 props 中的 form，用于模板绑定
const { form } = toRefs(props);

const innerFormRef = ref<FormInstance>();
const mapContainer = ref<HTMLDivElement>();
let map: maplibregl.Map | null = null;
let gpsMarker: Marker | null = null;

const DEFAULT_CENTER: [number, number] = [38.7, 9.0];
const roundCoord = (n: number) => Math.round(n * 1e6) / 1e6;

// 部分编辑模式下，ApprovedComment 使用本地状态，不使用服务数据
const localApprovedComment = ref<string>('');

// 监听 dialog 打开/关闭，管理 approvedComment
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // 打开对话框时
      if (props.mode === 'partial-edit') {
        // 部分编辑模式：清空本地状态，不使用服务数据
        localApprovedComment.value = '';
      } else if (props.showApprovedCommentInput?.(form.value)) {
        // 如果 showApprovedCommentInput 返回 true，清空原有数据，让用户输入
        form.value.approvedComment = '';
      }
    } else {
      // 关闭对话框时
      if (props.mode === 'partial-edit') {
        // 清空本地状态，避免下次打开时保留旧值
        localApprovedComment.value = '';
      }
      // 避免快速二次打开时复用到旧地图实例
      destroyMap();
    }
  }
);

// 监听 showApprovedCommentInput 的变化，如果返回 true 且对话框已打开，清空值
watch(
  () => props.showApprovedCommentInput?.(form.value),
  (shouldClear) => {
    if (shouldClear && props.modelValue) {
      if (props.mode === 'partial-edit') {
        localApprovedComment.value = '';
      } else {
        form.value.approvedComment = '';
      }
    }
  }
);

// 监听本地 approvedComment 变化，同步到 form（用于提交）
watch(localApprovedComment, (newVal) => {
  if (props.mode === 'partial-edit') {
    form.value.approvedComment = newVal;
  }
});

// ApprovedComment 的值：
// 1. partial-edit 模式使用本地状态
// 2. 其他模式使用 form 中的数据
// 注意：如果 showApprovedCommentInput 返回 true，会在对话框打开时清空值（在 watch 中处理）
const approvedCommentValue = computed({
  get() {
    if (props.mode === 'partial-edit') {
      return localApprovedComment.value;
    }
    return form.value.approvedComment || '';
  },
  set(val: string) {
    if (props.mode === 'partial-edit') {
      localApprovedComment.value = val;
    } else {
      form.value.approvedComment = val;
    }
  }
});

// 判断普通字段是否为只读模式
// readonly: 所有字段只读
// partial-edit: 除了 ApprovedComment 外，其他字段只读
// all-edit: 所有字段可编辑
const isReadonlyMode = computed(() => {
  return props.mode === 'readonly' || props.mode === 'partial-edit' || props.mode === 'readonlyzzz';
});

// 判断 ApprovedComment 是否禁用
const isApprovedCommentDisabled = computed(() => {
  // 只读模式下禁用
  if (props.mode === 'readonly' || props.mode === 'readonlyzzz') {
    return true;
  }
  // partial-edit 和 all-edit 模式下可编辑
  return false;
});

const statusList = computed<AgroprocessorStatus[]>(() => {
  // 如果外部配置了顺序，则优先使用外部配置
  if (props.statusOrder && props.statusOrder.length > 0) {
    return props.statusOrder;
  }
  // 默认：按枚举数值从大到小排序（降序），从左到右展示
  const values = Object.values(AgroprocessorStatus).filter((v) => typeof v === 'number') as AgroprocessorStatus[];
  return values.sort((a, b) => b - a);
});

const onUpdateVisible = (val: boolean) => {
  emit('update:modelValue', val);
};

const handleCancel = () => {
  emit('cancel');
};

const handleStatusClick = (status: AgroprocessorStatus) => {
  if (props.statusButtonHandlers && props.statusButtonHandlers[status]) {
    props.statusButtonHandlers[status]!();
  }
};

// 根据不同的 AgroprocessorStatus 返回按钮的 type
const getButtonType = (status: AgroprocessorStatus): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  // 默认都是 primary，后续可以根据不同状态配置不同的 type
  const buttonTypeMap: Record<AgroprocessorStatus, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    [AgroprocessorStatus.Draft]: 'primary',
    [AgroprocessorStatus.Submitted]: 'primary',
    [AgroprocessorStatus.Approved]: 'primary',
    [AgroprocessorStatus.Rejected]: 'warning',
    [AgroprocessorStatus.NeedRevision]: 'warning'
  };
  return buttonTypeMap[status] || 'primary';
};

// 判断是否有其他按钮（Save 或状态按钮）
const hasOtherButtons = computed(() => {
  if (props.mode !== 'partial-edit' && props.mode !== 'all-edit') {
    return false;
  }
  // 检查是否有 Save 按钮
  const hasSaveButton = props.showSaveButton && props.saveHandler;

  // 检查是否有状态按钮
  const hasStatusButtons = props.statusButtonHandlers && statusList.value.some((status) => props.statusButtonHandlers?.[status]);

  return hasSaveButton || hasStatusButtons;
});

// 关闭按钮文字：如果有其他按钮则显示 Cancel，否则显示 Close
const cancelButtonText = computed(() => {
  return hasOtherButtons.value ? 'Cancel' : 'Close';
});

const onMapClick = (e: maplibregl.MapMouseEvent) => {
  if (isReadonlyMode.value) return;
  const { lat, lng } = e.lngLat;
  form.value.gpsLat = roundCoord(lat);
  form.value.gpsLong = roundCoord(lng);
};

const initMap = () => {
  if (map || !mapContainer.value) return;
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: DEFAULT_CENTER,
    zoom: 10
  });
  map.once('load', () => {
    if (!map) return;
    map.on('click', onMapClick);
    map.resize();
    updateMapMarker();
  });
};

const handleDialogOpened = () => {
  nextTick(() => {
    initMap();
    updateMapMarker();
    map?.once('idle', () => {
      updateMapMarker();
    });
  });
};

const handleDialogClosed = () => {
  destroyMap();
};

const updateMapMarker = () => {
  if (!map) return;
  const lat = Number(form.value.gpsLat);
  const lng = Number(form.value.gpsLong);
  if (gpsMarker) {
    gpsMarker.remove();
    gpsMarker = null;
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  gpsMarker = new Marker({ color: '#e63946' }).setLngLat([lng, lat]).addTo(map);
  map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 12) });
};

const destroyMap = () => {
  if (!map) return;
  map.off('click', onMapClick);
  if (gpsMarker) {
    gpsMarker.remove();
    gpsMarker = null;
  }
  map.remove();
  map = null;
};

watch(
  () => [form.value.gpsLat, form.value.gpsLong] as const,
  () => {
    updateMapMarker();
  }
);

onUnmounted(() => {
  destroyMap();
});

// 暴露表单引用和本地 approvedComment 给父组件
defineExpose({
  formRef: innerFormRef,
  localApprovedComment
});
</script>

<style scoped>
.dialog-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.form-panel {
  flex: 1 1 0;
  min-width: 0;
}

.map-panel {
  flex: 1 1 0;
  min-width: 0;
}

.map-tip {
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.gps-map {
  width: 100%;
  height: 560px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
}
</style>
