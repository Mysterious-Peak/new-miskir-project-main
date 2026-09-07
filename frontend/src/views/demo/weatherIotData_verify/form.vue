<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="weatherIotDataFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <div class="flex gap-2 flex-1">
            <el-input v-model="form.prodSeasonId" placeholder="Please enter Production Season ID" disabled />
            <!-- <SelectProductionSeason v-model="form.prodSeasonId"></SelectProductionSeason> -->
          </div>
        </el-form-item>
        <!-- <el-form-item label="Farmland ID (Optional)" prop="farmlandId">
          <div class="flex gap-2 flex-1">
            <el-input v-model="form.farmlandId" placeholder="Please enter Farmland ID (Optional)" disabled />
            <SelectFarmLand v-model="form.farmlandId" />
          </div>
        </el-form-item> -->
        <el-form-item label="Data Record Timestamp" prop="timestamp">
          <el-date-picker
            clearable
            v-model="form.timestamp"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Data Record Timestamp"
            disabled
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Rainfall (mm)" prop="rainfallMm">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="9999.99"
            v-model="form.rainfallMm"
            placeholder="Please enter Rainfall (mm)"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="Temperature (°C)" prop="temperatureC">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="999.99"
            v-model="form.temperatureC"
            placeholder="Please enter Temperature (°C)"
            :disabled="true"
          />
        </el-form-item>
        <!-- <el-form-item label="Min Temperature (°C)" prop="temperatureMinC">
          <el-input-number style="width: 500px" :min="0" :max="999.99" placeholder="Please enter Min Temperature (°C)" />
        </el-form-item>
        <el-form-item label="Max Temperature (°C)" prop="temperatureMaxC">
          <el-input-number
            style="width: 500px"
            :min="0"
            :max="999.99"
            v-model="form.temperatureMaxC"
            placeholder="Please enter Max Temperature (°C)"
          />
        </el-form-item> -->
        <el-form-item label="Humidity (%)" prop="humidityPct">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="999.99"
            v-model="form.humidityPct"
            placeholder="Please enter Humidity (%)"
            :disabled="true"
          />
        </el-form-item>
        <!-- <el-form-item label="Wind Speed (m/s)" prop="windSpeedMs">
          <el-input v-model="form.windSpeedMs" placeholder="Please enter Wind Speed (m/s)" />
        </el-form-item> -->
        <!-- <el-form-item label="Solar Radiation" prop="solarRadiation">
          <el-input v-model="form.solarRadiation" placeholder="Please enter Solar Radiation" />
        </el-form-item> -->
        <el-form-item label="Soil Moisture (%)" prop="soilMoisturePct">
          <el-input-number v-model="form.soilMoisturePct" placeholder="Please enter Soil Moisture (%)" :disabled="true" />
        </el-form-item>
        <!-- <el-form-item label="Soil Temperature (°C)" prop="soilTemperatureC">
          <el-input v-model="form.soilTemperatureC" placeholder="Please enter Soil Temperature (°C)" />
        </el-form-item> -->
        <!-- <el-form-item label="Soil EC" prop="soilEc">
          <el-input v-model="form.soilEc" placeholder="Please enter Soil EC" />
        </el-form-item> -->
        <el-form-item label="Data Source" prop="dataSource">
          <el-select v-model="form.dataSource" placeholder="Please select Data Source" clearable :disabled="true">
            <el-option label="IoT" value="IoT" />
            <el-option label="AWS" value="AWS" />
            <el-option label="Satellite" value="Satellite" />
            <el-option label="Manual" value="Manual" />
          </el-select>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ApprovalStatus.Draft.toString()"
          />
        </el-form-item>
        <!-- <el-form-item label="Device ID" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="Please enter Device ID" />
        </el-form-item> -->
        <!-- <el-form-item label="Data Quality (Good/Fair/Poor)" prop="dataQuality">
          <el-input v-model="form.dataQuality" placeholder="Please enter Data Quality (Good/Fair/Poor)" />
        </el-form-item> -->
        <!-- <el-form-item label="Department ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="Please enter Department ID" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" />
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <div class="dialog-footer" v-if="form.status && form.status == ApprovalStatus.Draft.toString()">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
        <div class="dialog-footer" v-if="form.status != ApprovalStatus.Draft.toString()">
          <el-button @click="cancel">Close</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="WeatherIotDataApproveForm" lang="ts">
import { getWeatherIotData, addWeatherIotData, updateWeatherIotData } from '@/api/demo/weatherIotData';
import { WeatherIotDataForm } from '@/api/demo/weatherIotData/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const weatherIotDataFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isSubmit = computed(() => route.path.endsWith('/submit') || route.path.includes('/submit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: WeatherIotDataForm = {
  weatherId: undefined,
  prodSeasonId: undefined,
  farmlandId: undefined,
  timestamp: undefined,
  rainfallMm: undefined,
  temperatureC: undefined,
  temperatureMinC: undefined,
  temperatureMaxC: undefined,
  humidityPct: undefined,
  windSpeedMs: undefined,
  solarRadiation: undefined,
  soilMoisturePct: undefined,
  soilTemperatureC: undefined,
  soilEc: undefined,
  dataSource: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined
};

const form = ref<WeatherIotDataForm>({ ...initFormData });

const rules = {
  weatherId: [{ required: true, message: 'Data ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
  timestamp: [{ required: true, message: 'Data Record Timestamp cannot be empty', trigger: 'blur' }]
};

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getWeatherIotData(id.value);
    Object.assign(form.value, res.data);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel / Close Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button - Approval */
const submitForm = () => {
  weatherIotDataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      if (form.value.weatherId) {
        await updateWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const RevisionForm = () => {
  weatherIotDataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.weatherId) {
        await updateWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  weatherIotDataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.weatherId) {
        await updateWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

onMounted(() => {
  loadRecord();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
