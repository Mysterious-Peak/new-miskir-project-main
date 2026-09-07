<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="croppingPlanFormRef" :model="form" :rules="rules" label-width="220px" class="cropping-plan-dialog-form">
        <div class="cropping-dialog-section">
          <div class="cropping-dialog-section__title">Plan Scope</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Plan Scope" prop="planScope">
                <el-radio-group v-model="form.planScope" :disabled="isViewFlag(form)" @change="handlePlanScopeChange">
                  <el-radio-button label="FARMLAND">FarmLand</el-radio-button>
                  <el-radio-button label="CLUSTER">Cluster</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- Farm land context (read-only from selected farmland) -->
        <div v-if="form.planScope !== 'CLUSTER'" class="cropping-dialog-section cropping-dialog-section--farmland">
          <div class="cropping-dialog-section__title">Farm Land Information</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Farm Land ID" prop="farmlandId">
                <el-select
                  v-model="form.farmlandId"
                  class="!w-full"
                  filterable
                  remote
                  clearable
                  reserve-keyword
                  placeholder="Please input"
                  :remote-method="farmLandRemoteMethodPop"
                  :loading="farmLandLoading"
                  :debounce="300"
                  v-if="!isViewFlag(form)"
                >
                  <el-option v-for="item in farmLandOptionsPop" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-else v-model="form.farmlandId" placeholder="Please input" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Farmer ID">
                <el-input :model-value="formatFarmlandField(farmlandInfoDisplay?.farmerId)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Kebele ID">
                <el-input :model-value="formatFarmlandField(farmlandInfoDisplay?.kebeleId)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Latitude">
                <el-input :model-value="formatCoordinate(farmlandInfoDisplay?.gpsLat)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Longitude">
                <el-input :model-value="formatCoordinate(farmlandInfoDisplay?.gpsLong)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Area(ha)">
                <el-input :model-value="formatAreaHa(farmlandInfoDisplay?.areaTa)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Soil Name">
                <el-input :model-value="getSoilNameByCode(farmlandInfoDisplay?.soilCode)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Irrigation Name">
                <el-input :model-value="getIrrigationNameByCode(farmlandInfoDisplay?.irrigationCode)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Slope Class">
                <el-input :model-value="formatSlopeClassDisplay(farmlandInfoDisplay?.slopeClass)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Land Use Type">
                <el-input :model-value="formatLandUseTypeDisplay(farmlandInfoDisplay?.landUseType)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-if="form.planScope === 'CLUSTER'" class="cropping-dialog-section cropping-dialog-section--cluster">
          <div class="cropping-dialog-section__title">Cluster Information</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Cluster ID" prop="clusterId">
                <el-select
                  v-model="form.clusterId"
                  class="!w-full"
                  filterable
                  remote
                  clearable
                  reserve-keyword
                  placeholder="Please input"
                  :remote-method="clusterRemoteMethod"
                  :loading="clusterLoading"
                  :debounce="300"
                  v-if="!isViewFlag(form)"
                >
                  <el-option v-for="item in clusterOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-else v-model="form.clusterId" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Cluster Name">
                <el-input :model-value="clusterInfoDisplay?.clusterName || form.clusterName || ''" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Kebele ID">
                <el-input :model-value="clusterInfoDisplay?.kebeleId || ''" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Total Area (ha)">
                <el-input :model-value="formatAreaHa(clusterTotalAreaTa)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Parcel Count">
                <el-input :model-value="String(clusterInfoDisplay?.parcelCount ?? clusterInfoDisplay?.parcels?.length ?? '')" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-table v-if="clusterInfoDisplay?.parcels?.length" :data="clusterInfoDisplay.parcels" border stripe size="small">
            <el-table-column label="FarmLand ID" prop="farmlandId" align="center" />
            <el-table-column label="Farmer ID" prop="farmerId" align="center" />
            <el-table-column label="Area(ha)" prop="areaTa" align="center" />
          </el-table>
        </div>
        <!-- Cropping plan (editable) -->
        <div class="cropping-dialog-section cropping-dialog-section--plan">
          <div class="cropping-dialog-section__title">Cropping Plan Information</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Year" prop="year">
                <el-date-picker
                  v-model="yearProxy"
                  type="year"
                  format="YYYY"
                  value-format="YYYY"
                  placeholder="Pick a year"
                  :disabled="isViewFlag(form)"
                  clearable
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Season" prop="seasonName">
                <el-select
                  v-model="form.seasonId"
                  class="!w-full"
                  placeholder="Please select"
                  @change="onSeasonChange"
                  :disabled="isViewFlag(form)"
                  clearable
                >
                  <el-option v-for="dict in seasonOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Crop Type" prop="cropCode">
                <el-select
                  v-model="form.cropCode"
                  filterable
                  remote
                  clearable
                  reserve-keyword
                  placeholder="Please input"
                  :remote-method="cropCodeRemoteMethodPopup"
                  :loading="cropCodeLoading"
                  :debounce="300"
                  v-if="!isViewFlag(form)"
                  class="!w-full"
                >
                  <el-option v-for="item in cropCodeOptionsPopup" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-else v-model="form.cropCode" placeholder="Please input Crop Type" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Area(ha)" prop="plannedAreaTa">
                <el-input-number
                  v-model="form.plannedAreaTa"
                  placeholder="Please input Area(ha)"
                  :min="0"
                  :max="99999.99"
                  style="width: 100%"
                  :disabled="isViewFlag(form)"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Anticipated Yield" prop="plannedYieldQt">
                <el-input-number
                  v-model="form.plannedYieldQt"
                  placeholder="Please input Anticipated Yield"
                  :min="0"
                  :max="99999999.99"
                  style="width: 100%"
                  :disabled="isViewFlag(form)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Remaining Area (ha)">
                <el-input
                  :model-value="form.planScope === 'CLUSTER' ? clusterRemainingAreaDisplay : form.farmlandId ? remainingAreaDisplay : ''"
                  disabled
                  class="!w-full"
                  :class="remainingAreaIsNegative ? 'remaining-area-negative' : ''"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Planting Window Start" prop="plantingWindowStart">
                <div class="flex w-full min-w-0 items-center gap-2">
                  <el-date-picker
                    class="flex-1"
                    clearable
                    v-model="form.plantingWindowStart"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="Please select Planting Window Start"
                    :disabled="isViewFlag(form) || form.year == undefined || form.seasonId == undefined"
                    :disabled-date="plantStart_disabledDate"
                    :default-value="plantStart_defaultDate"
                  />
                  <el-tooltip
                    v-if="getSeasonHint('plantingStart')"
                    :content="getSeasonHintHtml('plantingStart')"
                    placement="top"
                    popper-class="season-hint-tooltip"
                    raw-content
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Planting Window End" prop="plantingWindowEnd">
                <div class="flex w-full min-w-0 items-center gap-2">
                  <el-date-picker
                    class="flex-1"
                    clearable
                    v-model="form.plantingWindowEnd"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="Please select Planting Window End"
                    :disabled="isViewFlag(form) || form.year == undefined || form.seasonId == undefined"
                    :disabled-date="plantEnd_disabledDate"
                    :default-value="plantEnd_defaultDate"
                  />
                  <el-tooltip
                    v-if="getSeasonHint('plantingEnd')"
                    :content="getSeasonHintHtml('plantingEnd')"
                    placement="top"
                    popper-class="season-hint-tooltip"
                    raw-content
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Harvest Window Start" prop="harvestWindowStart">
                <div class="flex w-full min-w-0 items-center gap-2">
                  <el-date-picker
                    class="flex-1"
                    clearable
                    v-model="form.harvestWindowStart"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="Please select Harvest Window Start"
                    :disabled="isViewFlag(form) || form.year == undefined || form.seasonId == undefined"
                    :disabled-date="harvestStart_disabledDate"
                    :default-value="harvestStart_defaultDate"
                  />
                  <el-tooltip
                    v-if="getSeasonHint('harvestStart')"
                    :content="getSeasonHintHtml('harvestStart')"
                    placement="top"
                    popper-class="season-hint-tooltip"
                    raw-content
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Harvest Window End" prop="harvestWindowEnd">
                <div class="flex w-full min-w-0 items-center gap-2">
                  <el-date-picker
                    class="flex-1"
                    clearable
                    v-model="form.harvestWindowEnd"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="Please select Harvest Window End"
                    :disabled="isViewFlag(form) || form.year == undefined || form.seasonId == undefined"
                    :disabled-date="harvestEnd_disabledDate"
                    :default-value="harvestEnd_defaultDate"
                  />
                  <el-tooltip
                    v-if="getSeasonHint('harvestEnd')"
                    :content="getSeasonHintHtml('harvestEnd')"
                    placement="top"
                    popper-class="season-hint-tooltip"
                    raw-content
                  >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="isViewFlag(form)">
            <el-col :span="12">
              <el-form-item label="Created By" prop="createdUserName">
                <el-input v-model="form.createdUserName" placeholder="Please input Created By" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Created Time" prop="createTime">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.createTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="isViewFlag(form)">
            <el-col :span="12">
              <el-form-item label="Approved By" prop="approvedUserName">
                <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Approved Time" prop="approvedAt">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.approvedAt"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="isViewFlag(form)">
            <el-col :span="24">
              <el-form-item label="Approval Comment" prop="approvedComment">
                <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- <el-form-item label="Status" prop="status">
          <el-tag>{{ CroppingPlanApprovalStatus[form.status as unknown as CroppingPlanApprovalStatus] }}</el-tag>
        </el-form-item> -->
      </el-form>
      <div class="form-footer" v-if="form.status">
        <el-button icon="SendPlane"
          :loading="buttonLoading"
          type="primary"
          @click="submitForm"
          v-if="
            (form.status == CroppingPlanApprovalStatus.Draft.toString() && form.planId) ||
            form.status == CroppingPlanApprovalStatus.NeedRevision.toString()
          "
          >Submit</el-button
        >
        <el-button @click="cancel" v-if="!isViewFlag(form)">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="saveForm" v-if="form.status == CroppingPlanApprovalStatus.Draft.toString()"
          >Save</el-button
        >
        <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="CroppingPlanForm" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { addCroppingPlan, getCroppingPlan, listCroppingPlan, updateCroppingPlan } from '@/api/demo/croppingPlan';
import { CroppingPlanForm, CroppingPlanVO } from '@/api/demo/croppingPlan/types';
import { getClusterFarming, listClusterFarming } from '@/api/demo/clusterFarming';
import { ClusterFarmingVO } from '@/api/demo/clusterFarming/types';
import { getFarmland, listFarmland } from '@/api/demo/farmland';
import { FarmlandVO } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { listSeasonMaster } from '@/api/demo/seasonMaster';
import { CroppingPlanApprovalStatus } from '@/enums/AgriculturalEnum';
import { selectDictLabel } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const croppingPlanFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const { harvest_window_start, harvest_window_end, planting_window_end, planting_window_start, slope_class, land_use_type } = toRefs<any>(
  proxy?.useDict('harvest_window_start', 'harvest_window_end', 'planting_window_end', 'planting_window_start', 'slope_class', 'land_use_type')
);

const formatSlopeClassDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(slope_class.value, value as string) || '';
};

const formatLandUseTypeDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(land_use_type.value, value as string) || '';
};

const croppingPlanAllList = ref<CroppingPlanVO[]>([]);
const cropCodeNameMap = ref<Record<string, string>>({});

const initFormData: CroppingPlanForm = {
  planId: undefined,
  planScope: 'FARMLAND',
  clusterId: undefined,
  clusterName: undefined,
  farmlandId: undefined,
  seasonId: undefined,
  year: undefined,
  cropCode: undefined,
  plannedAreaTa: undefined,
  plannedYieldQt: undefined,
  plantingWindowStart: undefined,
  plantingWindowEnd: undefined,
  harvestWindowStart: undefined,
  harvestWindowEnd: undefined,
  status: CroppingPlanApprovalStatus.Draft.toString(),
  createdUserName: undefined,
  createTime: undefined,
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedAt: undefined,
  deptId: undefined,
  remark: undefined,
  seasonName: undefined,
  approvedComment: undefined
};

const form = ref<CroppingPlanForm>({ ...initFormData });

/** Validate year - must be greater than or equal to current year */
const validateYear = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('Year can not be null'));
    return;
  }
  const currentYear = new Date().getFullYear();
  const inputYear = typeof value === 'number' ? value : parseInt(value, 10);
  // if (isNaN(inputYear)) {
  //   callback(new Error('Year must be a valid number'));
  //   return;
  // }
  if (inputYear < currentYear) {
    callback(new Error(`Year cannot be less than ${currentYear}`));
    return;
  }
  callback();
};

const rules = {
  // planId: [{ required: true, message: '自增ID不能为空', trigger: 'blur' }],

  planScope: [{ required: true, message: 'Plan Scope can not be null', trigger: 'change' }],
  farmlandId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (form.value.planScope !== 'CLUSTER' && !value) {
          callback(new Error('FarmLand ID can not be null'));
          return;
        }
        callback();
      },
      trigger: 'change'
    }
  ],
  clusterId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (form.value.planScope === 'CLUSTER' && !value) {
          callback(new Error('Cluster ID can not be null'));
          return;
        }
        callback();
      },
      trigger: 'change'
    }
  ],
  seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
  year: [
    { required: true, message: 'Year can not be null', trigger: 'blur' },
    { validator: validateYear, trigger: 'blur' }
  ],
  cropCode: [{ required: true, message: 'Crop Type can not be null', trigger: 'blur' }],
  plannedAreaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }],
  plannedYieldQt: [{ required: true, message: 'Yield can not be null', trigger: 'blur' }],
  // plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'blur' }],
  // plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'blur' }],
  // harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'blur' }],
  // harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'blur' }]

  plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'change' }],
  plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'change' }],
  harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'change' }],
  harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'change' }]
  // daCreatedBy: [{ required: true, message: '创建者不能为空', trigger: 'blur' }],
  // daCreatedAt: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }]
};

const farmLandLoading = ref(false);
const farmLandOptionsPop = ref([]);
const farmLandListPop = ref([]);
const farmLandLoadingPop = ref(false);
const farmLandRemoteMethodPop = async (query: string) => {
  if (query) {
    farmLandLoadingPop.value = true;

    const res = await listFarmland({ pageNum: 1, pageSize: null, id: query });
    farmLandListPop.value = res.rows;
    farmLandOptionsPop.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.id}`
    }));
    farmLandLoadingPop.value = false;
  } else {
    farmLandOptionsPop.value = [];
  }
};

const clusterOptions = ref<Array<{ value: string; label: string }>>([]);
const clusterLoading = ref(false);
const clusterRemoteMethod = async (query: string) => {
  if (query) {
    clusterLoading.value = true;
    const res = await listClusterFarming({ pageNum: 1, pageSize: 10, clusterId: query.trim() });
    clusterOptions.value = (res.rows || []).map((item) => ({
      value: item.clusterId,
      label: `${item.clusterId}${item.clusterName ? ` - ${item.clusterName}` : ''}`
    }));
    clusterLoading.value = false;
  } else {
    clusterOptions.value = [];
  }
};

const cropCodeLoading = ref(false);
const cropCodeOptionsPopup = ref([]);
const cropCodeListPopup = ref([]);
const cropCodeLoadingPopup = ref(false);
const cropCodeRemoteMethodPopup = async (query: string) => {
  if (query) {
    cropCodeLoadingPopup.value = true;

    const res = await listCropMaster({ pageNum: 1, pageSize: 10, cropCode: query });
    cropCodeListPopup.value = res.rows;

    cropCodeOptionsPopup.value = res.rows.map((item) => ({
      value: item.cropCode,
      label: `${item.cropName}`
    }));
    cropCodeLoadingPopup.value = false;
  } else {
    cropCodeOptionsPopup.value = [];
  }
};

const plantStart_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 5);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 9);
  }
  return true;
};
const plantStart_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 4, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 0, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 8, 1);
  }
  return new Date();
});
const plantEnd_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 7);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 3);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 11);
  }
  return true;
};
const plantEnd_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 6, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 2, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 10, 1);
  }
  return new Date();
});
const harvestStart_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 10);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 5);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 1);
  }
  return true;
};
const harvestStart_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 9, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 4, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 0, 1);
  }
  return new Date();
});
const harvestEnd_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 12);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 6);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 2);
  }
  return true;
};
const harvestEnd_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 11, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 5, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 1, 1);
  }
  return new Date();
});

const seasonOptions = ref([]);
const getSeasonList = async () => {
  const res = await listSeasonMaster();
  seasonOptions.value = res.rows.map((item) => ({
    value: item.id,
    label: item.seasonName
  }));
};

const onSeasonChange = (value) => {
  form.value.seasonName = seasonOptions.value.find((item) => item.value === value)?.label;
};

type SeasonHintKey = 'plantingStart' | 'plantingEnd' | 'harvestStart' | 'harvestEnd';

const SEASON_HINTS: Record<string, Record<SeasonHintKey, string>> = {
  Meher: {
    plantingStart: `Meher Planting Start
• Recommended: Late May
• Reference: ≥ May 25
Select a start date on or after this time.`,
    plantingEnd: `Meher Planting End
• Deadline: Mid-July
• Reference: ≤ July 15
Ensure sowing is completed by this date.`,
    harvestStart: `Meher Harvest Start
• Recommended: October
• Reference: ≥ Oct 1
Crops are typically ready for harvest from this date.`,
    harvestEnd: `Meher Harvest End
• Deadline: December
• Reference: ≤ Dec 31
All harvesting activities should be completed by this date.`
  },
  Belg: {
    plantingStart: `Belg Planting Start
• Recommended: January
• Reference: ≥ Jan 1
Begin planting as the short rains start.`,
    plantingEnd: `Belg Planting End
• Deadline: Early March
• Reference: ≤ Mar 10
The season is short; complete sowing early.`,
    harvestStart: `Belg Harvest Start
• Recommended: May
• Reference: ≥ May 1
Crops mature quickly; prepare to harvest.`,
    harvestEnd: `Belg Harvest End
• Deadline: June
• Reference: ≤ June 30
Finish harvesting before the dry season intensifies.`
  },
  Irrigation: {
    plantingStart: `Irrigation Season Start
• Recommended: September
• Reference: ≥ Sep 1
Utilize residual soil moisture or irrigation sources.`,
    plantingEnd: `Irrigation Season End
• Deadline: November
• Reference: ≤ Nov 30
Ensure crops have enough growth time before cold weather.`,
    harvestStart: `Irrigation Harvest Start
• Recommended: January
• Reference: ≥ Jan 1
Harvesting begins in the new year.`,
    harvestEnd: `Irrigation Harvest End
• Deadline: February
• Reference: ≤ Feb 28/29
Complete harvesting before the next Belg rains begin.`
  }
};

const getSeasonHint = (key: SeasonHintKey): string => {
  const seasonName = form.value.seasonName;
  if (!seasonName) return '';
  return SEASON_HINTS[seasonName]?.[key] ?? '';
};

const getSeasonHintHtml = (key: SeasonHintKey): string => {
  const text = getSeasonHint(key);
  return text ? text.replace(/\n/g, '<br/>') : '';
};

const getCropMasterList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 1000 });
  const map: Record<string, string> = {};
  (res.rows || []).forEach((item) => {
    if (!item?.cropCode) return;
    map[item.cropCode] = item.cropName || item.cropCode;
  });
  cropCodeNameMap.value = map;
  if (croppingPlanAllList.value.length > 0) {
    croppingPlanAllList.value = attachCropName(croppingPlanAllList.value);
  }
};

const attachCropName = (rows: CroppingPlanVO[] = []) => {
  return rows.map((item) => ({
    ...item,
    cropName: cropCodeNameMap.value[item.cropCode] || item.cropCode
  })) as CroppingPlanVO[];
};

const getAllList = async () => {
  const res = await listCroppingPlan();
  croppingPlanAllList.value = attachCropName(res.rows || []);
};

const currentFarmlandTotalAreaTa = ref<number | null>(null);

/** Popup: read-only farmland detail (not part of cropping plan form submit) */
const farmlandInfoDisplay = ref<FarmlandVO | null>(null);
const clusterInfoDisplay = ref<ClusterFarmingVO | null>(null);
const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);

const loadSoilAndIrrigationMasters = async () => {
  const [soilRes, irrRes] = await Promise.all([
    listSoilTypeMaster({ pageNum: 1, pageSize: 2000 }),
    listIrrigationTypeMaster({ pageNum: 1, pageSize: 2000 })
  ]);
  soilTypeMasterList.value = soilRes.rows || [];
  irrigationTypeMasterList.value = irrRes.rows || [];
};

const getSoilNameByCode = (code?: string) => {
  if (!code) return '';
  return soilTypeMasterList.value.find((item) => item.soilCode === code)?.soilName || code;
};
const getIrrigationNameByCode = (code?: string) => {
  if (!code) return '';
  return irrigationTypeMasterList.value.find((item) => item.irrigationCode === code)?.irrigationName || code;
};

const formatFarmlandField = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

const formatCoordinate = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(6) : String(value);
};

const formatAreaHa = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
};

const loadFarmlandInfoDisplay = async (farmlandId?: string | number | null) => {
  if (!farmlandId) {
    farmlandInfoDisplay.value = null;
    return;
  }
  try {
    const res: any = await getFarmland(farmlandId);
    const data = res?.data ?? res;
    farmlandInfoDisplay.value = data || null;
  } catch {
    farmlandInfoDisplay.value = null;
  }
};

const loadClusterInfoDisplay = async (clusterId?: string | null) => {
  if (!clusterId) {
    clusterInfoDisplay.value = null;
    return;
  }
  try {
    const listRes = await listClusterFarming({ pageNum: 1, pageSize: 10, clusterId });
    const match = (listRes.rows || []).find((item) => item.clusterId === clusterId) || listRes.rows?.[0];
    if (!match?.id) {
      clusterInfoDisplay.value = null;
      return;
    }
    const res: any = await getClusterFarming(match.id);
    const data = res?.data ?? res;
    clusterInfoDisplay.value = data || null;
    form.value.clusterName = data?.clusterName || match.clusterName;
  } catch {
    clusterInfoDisplay.value = null;
  }
};

const getNumericValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const allocatedAreaTaExcludingCurrentPlan = computed(() => {
  if (!form.value.farmlandId || !form.value.year || !form.value.seasonId) return 0;
  return croppingPlanAllList.value
    .filter(
      (item) =>
        String(item.farmlandId) === String(form.value.farmlandId) &&
        String(item.year) === String(form.value.year) &&
        String(item.seasonId) === String(form.value.seasonId) &&
        String(item.planId) !== String(form.value.planId || '') &&
        item.status !== CroppingPlanApprovalStatus.Rejected.toString()
    )
    .reduce((sum, item) => sum + getNumericValue(item.plannedAreaTa), 0);
});

const remainingAreaBeforeCurrentInput = computed(() => {
  return getNumericValue(currentFarmlandTotalAreaTa.value) - allocatedAreaTaExcludingCurrentPlan.value;
});

const remainingAreaAfterCurrentInput = computed(() => {
  return remainingAreaBeforeCurrentInput.value - getNumericValue(form.value.plannedAreaTa);
});

const remainingAreaDisplay = computed(() => remainingAreaAfterCurrentInput.value.toFixed(2));

const clusterTotalAreaTa = computed(() => {
  const fromParcels = clusterInfoDisplay.value?.parcels?.reduce((sum, item) => sum + getNumericValue(item.areaTa), 0);
  if (fromParcels && fromParcels > 0) return fromParcels;
  return getNumericValue(clusterInfoDisplay.value?.totalAreaTa);
});

const clusterRemainingAreaAfterCurrentInput = computed(() => clusterTotalAreaTa.value - getNumericValue(form.value.plannedAreaTa));
const clusterRemainingAreaDisplay = computed(() => clusterRemainingAreaAfterCurrentInput.value.toFixed(2));
const remainingAreaIsNegative = computed(() =>
  form.value.planScope === 'CLUSTER'
    ? !!form.value.clusterId && clusterRemainingAreaAfterCurrentInput.value < 0
    : !!form.value.farmlandId && remainingAreaAfterCurrentInput.value < 0
);

const loadFarmlandTotalArea = async (farmlandId?: string | number) => {
  if (!farmlandId) {
    currentFarmlandTotalAreaTa.value = null;
    return;
  }
  const res = await listFarmland({ pageNum: 1, pageSize: 1, id: farmlandId });
  const match = (res.rows || []).find((item) => String(item.id) === String(farmlandId)) || res.rows?.[0];
  currentFarmlandTotalAreaTa.value = match ? getNumericValue(match.areaTa) : null;
};

watch(
  () => form.value.farmlandId,
  (value) => {
    if (form.value.planScope !== 'CLUSTER') {
      loadFarmlandTotalArea(value);
      loadFarmlandInfoDisplay(value);
    }
  }
);

watch(
  () => form.value.clusterId,
  (value) => {
    if (form.value.planScope === 'CLUSTER') {
      loadClusterInfoDisplay(value);
    }
  }
);

const handlePlanScopeChange = () => {
  if (form.value.planScope === 'CLUSTER') {
    form.value.farmlandId = undefined;
    farmlandInfoDisplay.value = null;
    currentFarmlandTotalAreaTa.value = null;
    loadClusterInfoDisplay(form.value.clusterId);
  } else {
    form.value.clusterId = undefined;
    form.value.clusterName = undefined;
    clusterInfoDisplay.value = null;
    loadFarmlandTotalArea(form.value.farmlandId);
    loadFarmlandInfoDisplay(form.value.farmlandId);
  }
};

const validateScopeAndArea = () => {
  if (form.value.planScope === 'CLUSTER') {
    if (!form.value.clusterId) {
      proxy?.$modal.msgError('Cluster ID can not be null');
      return false;
    }
    if (clusterTotalAreaTa.value <= 0) {
      proxy?.$modal.msgError('Cluster has no valid parcel area');
      return false;
    }
    if (clusterRemainingAreaAfterCurrentInput.value < 0) {
      proxy?.$modal.msgError('Planned area exceeds cluster total area');
      return false;
    }
    return true;
  }
  if (!form.value.farmlandId) {
    proxy?.$modal.msgError('FarmLand ID can not be null');
    return false;
  }
  if (remainingAreaAfterCurrentInput.value < 0) {
    proxy?.$modal.msgError('Planned area exceeds remaining farmland area');
    return false;
  }
  return true;
};

const isViewFlag = (data) => {
  return (
    data.status == CroppingPlanApprovalStatus.Submitted ||
    data.status == CroppingPlanApprovalStatus.Approved ||
    data.status == CroppingPlanApprovalStatus.Rejected
  );
};

const yearProxy = computed({
  get() {
    return form.value.year ? String(form.value.year) : '';
  },
  set(value) {
    form.value.year = value ? Number(value) : null;
  }
});

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    farmlandInfoDisplay.value = null;
    clusterInfoDisplay.value = null;
    currentFarmlandTotalAreaTa.value = null;
    croppingPlanFormRef.value?.resetFields();
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getCroppingPlan(id.value);
    Object.assign(form.value, res.data);
    form.value.planScope = form.value.planScope || 'FARMLAND';
    handlePlanScopeChange();
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

const saveForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!validateScopeAndArea()) return;
      buttonLoading.value = true;

      form.value.status = CroppingPlanApprovalStatus.Draft.toString();

      if (form.value.planId) {
        await updateCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
      await getAllList();
    }
  });
};

const submitForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!validateScopeAndArea()) return;
      buttonLoading.value = true;

      form.value.status = CroppingPlanApprovalStatus.Submitted.toString();
      if (form.value.planId) {
        await updateCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

onMounted(async () => {
  await loadSoilAndIrrigationMasters();
  getSeasonList();
  getCropMasterList();
  getAllList();
  await loadRecord();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

:deep(.season-hint-tooltip) {
  max-width: 420px;
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.5;
}

/* Wider label column + no wrap, avoid “Planting Window Start” etc. breaking in 2 columns */
.cropping-plan-dialog-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

/* el-input disabled 默认用 var(--el-disabled-text-color)，需显式覆盖 */
.cropping-plan-dialog-form :deep(.remaining-area-negative.el-input.is-disabled) {
  --el-disabled-text-color: var(--el-color-danger);
  --el-text-color-disabled: var(--el-color-danger);
  --el-input-text-color: var(--el-color-danger);
}
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled .el-input__inner),
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled .el-input__wrapper) {
  color: var(--el-color-danger) !important;
  -webkit-text-fill-color: var(--el-color-danger) !important;
}
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled input) {
  color: var(--el-color-danger) !important;
  -webkit-text-fill-color: var(--el-color-danger) !important;
}

.cropping-dialog-section {
  padding: 12px 16px 4px;
  margin-bottom: 16px;
}
.cropping-dialog-section:last-of-type {
  margin-bottom: 0;
}
.cropping-dialog-section__title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-primary);
}
</style>
