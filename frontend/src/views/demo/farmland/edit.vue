<template>
  <div class="p-2">
    <el-card shadow="hover" class="mb-[10px]">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <span class="font-semibold">{{ pageTitle }}</span>
      </div>
      <el-form ref="farmlandFormRef" :model="form" :rules="rules" label-width="auto">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="Farmer ID" prop="farmerId">
              <el-select
                v-model="form.farmerId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmerRemoteMethod"
                :loading="farmerLoading"
                :debounce="300"
                @change="onFarmerChange"
                v-if="!isViewMode"
                style="width: 100%"
              >
                <el-option v-for="item in farmerOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-input v-else v-model="form.farmerId" placeholder="" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Kebele ID" prop="kebeleId">
              <CascadingRegionSelect
                v-if="!isViewMode"
                :kebeleCode="form.kebeleId"
                @update:kebeleCode="form.kebeleId = $event"
              />
              <el-input v-else v-model="form.kebeleId" placeholder="" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Longitude" prop="gpsLong">
              <el-input-number v-model="form.gpsLong" placeholder="Please input Longitude" :min="0" :max="9999.999999" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Latitude" prop="gpsLat">
              <el-input-number v-model="form.gpsLat" placeholder="Please input Latitude" :min="0" :max="9999.999999" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Area(ha)" prop="areaTa">
              <el-input-number v-model="form.areaTa" placeholder="Please input Area(ha)" :min="0" :max="99999.99" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Altitude(m)" prop="elevationM">
              <el-input-number v-model="form.elevationM" placeholder="Please input Altitude" :min="0" :max="9999.99" :precision="2" style="width: 100%" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Soil Type" prop="soilCode">
              <el-select v-model="form.soilCode" placeholder="Please select Soil Type" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in soilTypeMasterList" :key="item.id" :label="item.soilName" :value="item.soilCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Irrigation Type" prop="irrigationCode">
              <el-select v-model="form.irrigationCode" multiple collapse-tags placeholder="Please select Irrigation Type" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in irrigationTypeMasterList" :key="item.id" :label="item.irrigationName" :value="item.irrigationCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Slope Class" prop="slopeClass">
              <el-select v-model="form.slopeClass" placeholder="Please select Slope Class" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in slope_class" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Land Use Type" prop="landUseType">
              <el-select v-model="form.landUseType" placeholder="Please select Use Type" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in land_use_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Land Ownership Type" prop="landOwnershipType">
              <el-select v-model="form.landOwnershipType" placeholder="Please select" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in land_ownership_type" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Aspect / Slope Direction" prop="slopeAspect">
              <el-select v-model="form.slopeAspect" placeholder="Please select" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in slope_aspect" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Sampling depth" prop="samplingDepth">
              <el-select v-model="form.samplingDepth" placeholder="Please select" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in sampling_depth" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Land use history" prop="landUseRecord">
              <el-select v-model="form.landUseRecord" placeholder="Please select" style="width: 100%" :disabled="isViewMode" clearable>
                <el-option v-for="item in land_use_record" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="Accessibility to infrastructure" prop="infrastructureAccessibility">
              <el-input v-model="form.infrastructureAccessibility" placeholder="Please input accessibility information" type="textarea" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <template v-if="isViewMode">
            <el-col :span="8">
              <el-form-item label="Created By">
                <el-input v-model="form.createdUserName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Created Time">
                <el-date-picker v-model="form.createTime" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Approved By">
                <el-input v-model="form.approvedUserName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Approved Time">
                <el-date-picker v-model="form.approvedTime" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="Approval Comment">
                <el-input v-model="form.approvedComment" type="textarea" disabled />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="mb-[10px] map-card">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <span class="font-semibold">Map / Polygon</span>
      </div>
      <div style="overflow: visible !important; position: relative;">
        <template v-if="pageReady">
          <MapPolygonForFarmLandApproval
            v-if="isViewMode"
            :init-polygon="form.gpsPolygon ? JSON.parse(form.gpsPolygon) : []"
            :gps-lat="form.gpsLat"
            :gps-long="form.gpsLong"
          />
          <MapPolygonForFarmLand
            v-else
            :init-polygon="form.gpsPolygon ? JSON.parse(form.gpsPolygon) : []"
            :onGenerateJson="onGeneratePolygonJson"
            :gps-lat="form.gpsLat"
            :gps-long="form.gpsLong"
            @pick-gps="onPickGpsFromMap"
          />
        </template>
      </div>
    </el-card>

    <div class="mt-4 text-center">
      <el-button @click="handleCancel">Cancel</el-button>
      <el-button :loading="buttonLoading" type="primary" @click="submitForm" v-if="!isViewMode">Save</el-button>
    </div>
  </div>
</template>

<script setup name="FarmlandEdit" lang="ts">
import { getFarmerInfoList } from '@/api/demo/farmer';
import {
  addFarmland,
  getFarmland,
  updateFarmland
} from '@/api/demo/farmland';
import { FarmlandForm } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import CascadingRegionSelect from '@/components/CascadingRegionSelect/index.vue';
import MapPolygonForFarmLand from '@/components/Map/MapPolygonForFarmLand.vue';
import MapPolygonForFarmLandApproval from '@/components/Map/MapPolygonForFarmLandApproval.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { slope_class, land_use_type } = toRefs<any>(proxy?.useDict('slope_class', 'land_use_type'));
const { land_ownership_type, slope_aspect, sampling_depth, land_use_record } = toRefs<any>(
  proxy?.useDict('land_ownership_type', 'slope_aspect', 'sampling_depth', 'land_use_record')
);

const farmlandFormRef = ref<ElFormInstance>();
const buttonLoading = ref(false);
const isViewMode = ref(false);
const pageReady = ref(false);

const pageTitle = computed(() => {
  if (isViewMode.value) return 'View FarmLand Info';
  return form.value.id ? 'Edit FarmLand Info' : 'Add New FarmLand';
});

const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
async function getSoilTypes() {
  const res = await listSoilTypeMaster();
  soilTypeMasterList.value = res.rows;
}
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
async function getIrrigationTypes() {
  const res = await listIrrigationTypeMaster();
  irrigationTypeMasterList.value = res.rows;
}

const farmerOptions = ref([]);
const farmerList = ref([]);
const farmerLoading = ref(false);
const farmerRemoteMethod = async (query: string) => {
  if (query) {
    farmerLoading.value = true;
    const res = await getFarmerInfoList({ farmerId: query });
    const list = res.data || [];
    farmerList.value = list;
    farmerOptions.value = list.map((item: any) => ({
      value: item.farmerId,
      label: `${item.farmerId}`
    }));
    farmerLoading.value = false;
  } else {
    farmerOptions.value = [];
  }
};

const onFarmerChange = (value: string) => {
  form.value.kebeleId = farmerList.value.find((item: any) => item.farmerId == value)?.kebeleCode || '';
};

const initFormData: FarmlandForm = {
  id: undefined,
  farmerId: undefined,
  kebeleId: undefined,
  gpsLat: undefined,
  gpsLong: undefined,
  gpsPolygon: undefined,
  areaTa: undefined,
  soilCode: undefined,
  irrigationCode: [] as string[],
  slopeClass: undefined,
  landUseType: undefined,
  landOwnershipType: undefined,
  slopeAspect: undefined,
  samplingDepth: undefined,
  landUseRecord: undefined,
  infrastructureAccessibility: undefined,
  elevationM: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedTime: undefined,
  rejectionReason: undefined,
  createdUserName: undefined,
  createTime: undefined,
  remark: undefined,
  approvedComment: undefined
};

const data = reactive<{ form: FarmlandForm; rules: any }>({
  form: { ...initFormData },
  rules: {
    id: [{ required: true, message: 'Farm ID can not be null', trigger: 'blur' }],
    farmerId: [{ required: true, message: 'Farmer ID can not be null', trigger: 'blur' }],
    kebeleId: [{ required: true, message: 'Kebele ID can not be null', trigger: 'blur' }],
    gpsLat: [{ required: true, message: 'Please input Latitude', trigger: 'blur' }],
    gpsLong: [{ required: true, message: 'Please input Longitude', trigger: 'blur' }],
    elevationM: [{ required: true, message: 'Please input Altitude', trigger: 'blur' }],
    areaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }],
    soilCode: [{ required: true, message: 'Please select Soil Type', trigger: 'change' }],
    irrigationCode: [{ required: true, message: 'Please select Irrigation Type', trigger: 'change' }],
    landOwnershipType: [{ required: true, message: 'Please select Land Ownership Type', trigger: 'change' }],
    slopeAspect: [{ required: true, message: 'Please select Slope Aspect', trigger: 'change' }],
    samplingDepth: [{ required: true, message: 'Please select Sampling Depth', trigger: 'change' }],
    landUseRecord: [{ required: true, message: 'Please select Land Use Record', trigger: 'change' }],
    infrastructureAccessibility: [{ required: true, message: 'Please input Infrastructure Accessibility', trigger: 'blur' }]
  }
});

const { form, rules } = toRefs(data);

const reset = () => {
  form.value = { ...initFormData };
  farmlandFormRef.value?.resetFields();
};

const handleCancel = () => {
  proxy?.$tab.closePage(proxy?.$route);
  router.push({ path: '/farmland_management/farmland', query: { t: Date.now().toString() } });
};

const onGeneratePolygonJson = (json: string) => {
  form.value.gpsPolygon = json;
};

const onPickGpsFromMap = (payload: { lat: number; lng: number }) => {
  form.value.gpsLat = payload.lat;
  form.value.gpsLong = payload.lng;
};

const submitForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Draft.toString();
      const submitData = { ...form.value };
      if (Array.isArray(submitData.irrigationCode)) {
        submitData.irrigationCode = (submitData.irrigationCode as string[]).join(',');
      }
      if (submitData.id) {
        await updateFarmland(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      handleCancel();
    }
  });
};

const loadFarmland = async (id: string) => {
  const res = await getFarmland(id);
  Object.assign(form.value, res.data);
  // API 返回经纬度为 string，MapPolygonForFarmLand 组件要求 Number，显式转换
  if (typeof form.value.gpsLat === 'string') form.value.gpsLat = Number(form.value.gpsLat);
  if (typeof form.value.gpsLong === 'string') form.value.gpsLong = Number(form.value.gpsLong);
  if (form.value.irrigationCode && typeof form.value.irrigationCode === 'string') {
    form.value.irrigationCode = (form.value.irrigationCode as string).split(',').filter(Boolean) as any;
  } else if (!form.value.irrigationCode) {
    form.value.irrigationCode = [];
  }
};

onMounted(async () => {
  getSoilTypes();
  getIrrigationTypes();

  const id = route.query.id as string | undefined;
  const mode = route.query.mode as string | undefined;

  if (mode === 'view') {
    isViewMode.value = true;
  }

  if (id) {
    await loadFarmland(id);
    if (form.value.status == ApprovalStatus.Approved.toString() || form.value.status == ApprovalStatus.Rejected.toString()) {
      isViewMode.value = true;
    }
  }
  pageReady.value = true;
});
</script>
