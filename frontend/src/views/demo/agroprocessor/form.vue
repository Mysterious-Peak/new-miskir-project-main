<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
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
      <div class="form-footer">
        <!-- 只读模式：只显示 Close 按钮 -->
        <template v-if="mode === 'readonly'">
          <el-button @click="cancel">Close</el-button>
        </template>
        <!-- 部分编辑模式和全部编辑模式：根据回调函数显示按钮 -->
        <template v-else-if="mode === 'partial-edit' || mode === 'all-edit' || mode === 'readonlyzzz'">
          <el-button v-if="showSaveButton" type="primary" :loading="buttonLoading" @click="submitForm"> Save </el-button>
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
          <el-button @click="cancel">{{ cancelButtonText }}</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="AgroprocessorForm" lang="ts">
import { getAgroprocessor, addAgroprocessor, updateAgroprocessor } from '@/api/demo/agroprocessor';
import type { AgroprocessorForm } from '@/api/demo/agroprocessor/types';
import { AgroprocessorStatus } from '@/enums/AgriculturalEnum';
import maplibregl, { Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type DialogMode = 'readonly' | 'partial-edit' | 'all-edit' | 'readonlyzzz';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { ownership_type, t_agroprocessor_type, technology_level, region } = toRefs<any>(
  proxy?.useDict('ownership_type', 't_agroprocessor_type', 'technology_level', 'region')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const innerFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isReview = computed(() => route.path.endsWith('/review') || route.path.includes('/review/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: AgroprocessorForm = {
  processorId: undefined,
  processorName: undefined,
  processorType: undefined,
  registrationNumber: undefined,
  tinNumber: undefined,
  ownershipType: undefined,
  region: undefined,
  zone: undefined,
  woreda: undefined,
  gpsLat: undefined,
  gpsLong: undefined,
  processingCapacityPerDay: undefined,
  technologyLevel: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};

const form = ref<AgroprocessorForm>({ ...initFormData });

const rules = {
  processorId: [{ required: true, message: 'Processor ID is required', trigger: 'blur' }],
  processorName: [{ required: true, message: 'Processor Name is required', trigger: 'blur' }],
  processorType: [{ required: true, message: 'Processor Type is required', trigger: 'change' }],
  ownershipType: [{ required: true, message: 'Ownership Type is required', trigger: 'change' }],
  technologyLevel: [{ required: true, message: 'Technology Level is required', trigger: 'change' }],
  status: [{ required: true, message: 'status is required', trigger: 'change' }]
};

// 页面 mode 判定：readonly-全部只读，partial-edit-部分编辑（只有ApprovedComment可编辑），all-edit-全部可编辑
const mode = computed<DialogMode>(() => {
  // 审批页：Submitted 可审批显示 partial-edit，其他状态只读显示 readonly
  if (isApprove.value) {
    return canEditApprove(form.value) ? 'partial-edit' : 'readonly';
  }
  // 复核页：Draft 可编辑显示 all-edit，其他状态只读显示 readonly
  if (isReview.value) {
    return canEditReview(form.value) ? 'all-edit' : 'readonly';
  }
  // 列表页：新增为 all-edit；编辑按 canEdit 判定 all-edit / readonly；查看为 readonly
  if (isAdd.value) {
    return 'all-edit';
  }
  if (isEdit.value) {
    return canEditIndex(form.value) ? 'all-edit' : 'readonly';
  }
  return 'readonly';
});

/** 列表页：判断是否可以编辑（草稿/未定义/需修订 可编辑） */
const canEditIndex = (row: AgroprocessorForm): boolean => {
  return row.status === String(AgroprocessorStatus.Draft) || row.status == undefined || row.status === String(AgroprocessorStatus.NeedRevision);
};

/** 审批页：判断是否可以编辑（Submitted 可审批） */
const canEditApprove = (row: AgroprocessorForm): boolean => {
  return row.status === String(AgroprocessorStatus.Submitted);
};

/** 复核页：判断是否可以编辑（Draft/未定义 可编辑） */
const canEditReview = (row: AgroprocessorForm): boolean => {
  return row.status === String(AgroprocessorStatus.Draft) || row.status == undefined;
};

/** 列表页：判断是否展示审批意见 */
const showApprovedCommentIndex = (row: AgroprocessorForm): boolean => {
  return row.status === String(AgroprocessorStatus.Approved) || row.status === String(AgroprocessorStatus.Rejected);
};

/** 审批页：判断是否展示审批意见 */
const showApprovedCommentApprove = (row: AgroprocessorForm): boolean => {
  return row.status === String(AgroprocessorStatus.Approved) || row.status === String(AgroprocessorStatus.Submitted);
};

/** 复核页：判断是否展示审批意见 */
const showApprovedCommentReview = (row: AgroprocessorForm): boolean => {
  return row.approvedComment != undefined && row.approvedComment != '';
};

/** 是否展示审批意见（回调函数，参数是row） */
const showApprovedComment = (row: AgroprocessorForm): boolean => {
  if (isApprove.value) {
    return showApprovedCommentApprove(row);
  }
  if (isReview.value) {
    return showApprovedCommentReview(row);
  }
  return showApprovedCommentIndex(row);
};

/** 是否显示审批意见输入框（回调函数，参数是row），如果返回true，则不显示原有数据，让用户输入 */
const showApprovedCommentInput = (row: AgroprocessorForm): boolean => {
  if (isApprove.value) {
    // 审批页：只有 Submitted 状态才需要编辑 ApprovedComment
    return row.status === String(AgroprocessorStatus.Submitted);
  }
  // 列表页/复核页：不显示审批意见输入框
  return false;
};

// 部分编辑模式下，ApprovedComment 使用本地状态，不使用服务数据
const localApprovedComment = ref<string>('');

// ApprovedComment 的值：
// 1. partial-edit 模式使用本地状态
// 2. 其他模式使用 form 中的数据
// 注意：如果 showApprovedCommentInput 返回 true，会清空值（在 loadRecord 中处理）
const approvedCommentValue = computed({
  get() {
    if (mode.value === 'partial-edit') {
      return localApprovedComment.value;
    }
    return form.value.approvedComment || '';
  },
  set(val: string) {
    if (mode.value === 'partial-edit') {
      localApprovedComment.value = val;
    } else {
      form.value.approvedComment = val;
    }
  }
});

// 监听本地 approvedComment 变化，同步到 form（用于提交）
watch(localApprovedComment, (newVal) => {
  if (mode.value === 'partial-edit') {
    form.value.approvedComment = newVal;
  }
});

// 判断普通字段是否为只读模式
// readonly: 所有字段只读
// partial-edit: 除了 ApprovedComment 外，其他字段只读
// all-edit: 所有字段可编辑
const isReadonlyMode = computed(() => {
  return mode.value === 'readonly' || mode.value === 'partial-edit' || mode.value === 'readonlyzzz';
});

// 判断 ApprovedComment 是否禁用
const isApprovedCommentDisabled = computed(() => {
  // 只读模式下禁用
  if (mode.value === 'readonly' || mode.value === 'readonlyzzz') {
    return true;
  }
  // partial-edit 和 all-edit 模式下可编辑
  return false;
});

const statusList = computed<AgroprocessorStatus[]>(() => {
  // 外部配置了顺序：列表页 [Rejected, Approved, Submitted, Draft]
  if (isAdd.value || isEdit.value || isDetail.value) {
    return [AgroprocessorStatus.Rejected, AgroprocessorStatus.Approved, AgroprocessorStatus.Submitted, AgroprocessorStatus.Draft];
  }
  // 审批页/复核页：[Approved, Submitted, Rejected, NeedRevision, Draft]
  return [AgroprocessorStatus.Approved, AgroprocessorStatus.Submitted, AgroprocessorStatus.Rejected, AgroprocessorStatus.NeedRevision, AgroprocessorStatus.Draft];
});

/** 底部各状态按钮对应的回调配置 */
const statusButtonHandlers = computed<Partial<Record<AgroprocessorStatus, () => void>>>(() => {
  const handlers: Partial<Record<AgroprocessorStatus, () => void>> = {};
  if (isApprove.value) {
    handlers[AgroprocessorStatus.Approved] = () => handleSubmitWithStatus(AgroprocessorStatus.Approved);
    handlers[AgroprocessorStatus.Rejected] = () => handleSubmitWithStatus(AgroprocessorStatus.Rejected);
    handlers[AgroprocessorStatus.NeedRevision] = () => handleSubmitWithStatus(AgroprocessorStatus.NeedRevision);
  } else if (isReview.value) {
    handlers[AgroprocessorStatus.Submitted] = () => handleSubmitWithStatus(AgroprocessorStatus.Submitted);
  }
  return handlers;
});

const handleStatusClick = (status: AgroprocessorStatus) => {
  if (statusButtonHandlers.value && statusButtonHandlers.value[status]) {
    statusButtonHandlers.value[status]!();
  }
};

/** 是否显示 Save 按钮（列表页新增/可编辑时显示；审批页/复核页不显示） */
const showSaveButton = computed(() => {
  if (isApprove.value || isReview.value) {
    return false;
  }
  if (isAdd.value) {
    return true;
  }
  if (isEdit.value) {
    return canEditIndex(form.value);
  }
  return false;
});

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
  if (mode.value !== 'partial-edit' && mode.value !== 'all-edit') {
    return false;
  }
  // 检查是否有 Save 按钮
  const hasSaveButton = showSaveButton.value;

  // 检查是否有状态按钮
  const hasStatusButtons = statusButtonHandlers.value && statusList.value.some((status) => statusButtonHandlers.value?.[status]);

  return hasSaveButton || hasStatusButtons;
});

// 关闭按钮文字：如果有其他按钮则显示 Cancel，否则显示 Close
const cancelButtonText = computed(() => {
  return hasOtherButtons.value ? 'Cancel' : 'Close';
});

// 地图相关
const mapContainer = ref<HTMLDivElement>();
let map: maplibregl.Map | null = null;
let gpsMarker: Marker | null = null;

const DEFAULT_CENTER: [number, number] = [38.7, 9.0];
const roundCoord = (n: number) => Math.round(n * 1e6) / 1e6;

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

/** Load record for edit/detail/approve/review mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getAgroprocessor(id.value);
    Object.assign(form.value, res.data);
    // 打开对话框时的逻辑：partial-edit 模式清空本地状态；showApprovedCommentInput 返回 true 时清空原有数据
    if (mode.value === 'partial-edit') {
      localApprovedComment.value = '';
    } else if (showApprovedCommentInput(form.value)) {
      form.value.approvedComment = '';
    }
  } finally {
    pageLoading.value = false;
  }
};

/** 点击不同状态按钮时提交表单 */
const handleSubmitWithStatus = (status: AgroprocessorStatus) => {
  form.value.status = String(status);
  submitForm();
};

/** 取消/关闭按钮 */
const cancel = () => {
  router.push(listPath.value);
};

/** 提交按钮 */
const submitForm = () => {
  // 列表页新增/修改：提交时固定为 Draft 状态（与列表页原逻辑一致）
  if (isAdd.value || isEdit.value) {
    form.value.status = String(AgroprocessorStatus.Draft);
  }
  innerFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      proxy?.$modal.msgError('Please check the form');
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.processorId) {
        await updateAgroprocessor(form.value);
      } else {
        await addAgroprocessor(form.value);
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(() => {
  loadRecord();
  nextTick(() => {
    initMap();
    updateMapMarker();
    map?.once('idle', () => {
      updateMapMarker();
    });
  });
});

onUnmounted(() => {
  destroyMap();
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

.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
