<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <!-- <el-input v-model="queryParams.prodSeasonId" placeholder="Please input Production Season ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethodFilter"
                :loading="productionSeasonLoadingFilter"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productionSeasonOptionsFilter" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="FarmLand ID" prop="farmlandId">
              <!-- <el-input v-model="queryParams.farmlandId" placeholder="Please input FarmLand ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.farmlandId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmLandRemoteMethod"
                :loading="farmLandLoading"
                :debounce="300"
              >
                <el-option v-for="item in farmLandOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Data Record Timestamp" prop="timestamp">
              <el-date-picker
                clearable
                v-model="queryParams.timestamp"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Data Record Timestamp"
              />
            </el-form-item>
            <!-- <el-form-item label="Rainfall (mm)" prop="rainfallMm">
              <el-input v-model="queryParams.rainfallMm" placeholder="Please enter Rainfall (mm)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Temperature (°C)" prop="temperatureC">
              <el-input v-model="queryParams.temperatureC" placeholder="Please enter Temperature (°C)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Min Temperature (°C)" prop="temperatureMinC">
              <el-input v-model="queryParams.temperatureMinC" placeholder="Please enter Min Temperature (°C)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Max Temperature (°C)" prop="temperatureMaxC">
              <el-input v-model="queryParams.temperatureMaxC" placeholder="Please enter Max Temperature (°C)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Humidity (%)" prop="humidityPct">
              <el-input v-model="queryParams.humidityPct" placeholder="Please enter Humidity (%)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Wind Speed (m/s)" prop="windSpeedMs">
              <el-input v-model="queryParams.windSpeedMs" placeholder="Please enter Wind Speed (m/s)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Solar Radiation" prop="solarRadiation">
              <el-input v-model="queryParams.solarRadiation" placeholder="Please enter Solar Radiation" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Soil Moisture (%)" prop="soilMoisturePct">
              <el-input v-model="queryParams.soilMoisturePct" placeholder="Please enter Soil Moisture (%)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Soil Temperature (°C)" prop="soilTemperatureC">
              <el-input
                v-model="queryParams.soilTemperatureC"
                placeholder="Please enter Soil Temperature (°C)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Soil EC" prop="soilEc">
              <el-input v-model="queryParams.soilEc" placeholder="Please enter Soil EC" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Data Source (IoT/AWS/Satellite/Manual)" prop="dataSource">
              <el-input
                v-model="queryParams.dataSource"
                placeholder="Please enter Data Source (IoT/AWS/Satellite/Manual)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Device ID" prop="deviceId">
              <el-input v-model="queryParams.deviceId" placeholder="Please enter Device ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Data Quality (Good/Fair/Poor)" prop="dataQuality">
              <el-input
                v-model="queryParams.dataQuality"
                placeholder="Please enter Data Quality (Good/Fair/Poor)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Department ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="Please enter Department ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:weatherIotData:remove']"
              >Delete</el-button
            >
          </el-col> --> 
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:weatherIotData:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="weatherIotDataList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Data ID" align="center" prop="weatherId" v-if="true" :min-width="getColumnWidth('Data ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <!-- <el-table-column label="Farmland ID (Optional)" align="center" prop="farmlandId" /> -->
        <el-table-column label="Data Record Timestamp" align="center" prop="timestamp" :min-width="getColumnWidth('Data Record Timestamp')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.timestamp, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Rainfall (mm)" align="center" prop="rainfallMm" :min-width="getColumnWidth('Rainfall (mm)')" />
        <el-table-column label="Temperature (°C)" align="center" prop="temperatureC" :min-width="getColumnWidth('Temperature (°C)')" />
        <!-- <el-table-column label="Min Temperature (°C)" align="center" prop="temperatureMinC" />
        <el-table-column label="Max Temperature (°C)" align="center" prop="temperatureMaxC" /> -->
        <el-table-column label="Humidity (%)" align="center" prop="humidityPct" :min-width="getColumnWidth('Humidity (%)')" />
        <!-- <el-table-column label="Wind Speed (m/s)" align="center" prop="windSpeedMs" />
        <el-table-column label="Solar Radiation" align="center" prop="solarRadiation" /> -->
        <el-table-column label="Soil Moisture (%)" align="center" prop="soilMoisturePct" :min-width="getColumnWidth('Soil Moisture (%)')" />
        <!-- <el-table-column label="Soil Temperature (°C)" align="center" prop="soilTemperatureC" />
        <el-table-column label="Soil EC" align="center" prop="soilEc" /> -->
        <el-table-column label="Data Source" align="center" prop="dataSource" :min-width="getColumnWidth('Data Source')" />
        <!-- <el-table-column label="Device ID" align="center" prop="deviceId" />
        <el-table-column label="Data Quality (Good/Fair/Poor)" align="center" prop="dataQuality" /> -->
        <!-- <el-table-column label="Department ID" align="center" prop="deptId" />
        <el-table-column label="Remark" align="center" prop="remark" /> -->
        <el-table-column label="Recorded By" align="center" prop="createdUserName" :min-width="getColumnWidth('Recorded By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Weather & IoT Data Dialog -->
  </div>
</template>

<script setup name="WeatherIotData" lang="ts">
import { listWeatherIotData, getWeatherIotData, delWeatherIotData, addWeatherIotData, updateWeatherIotData } from '@/api/demo/weatherIotData';
import { WeatherIotDataVO, WeatherIotDataQuery, WeatherIotDataForm } from '@/api/demo/weatherIotData/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { listFarmland } from '@/api/demo/farmland';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const weatherIotDataList = ref<WeatherIotDataVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const weatherIotDataFormRef = ref<ElFormInstance>();
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonAllList = ref<WeatherIotDataVO[]>([]);
const farmLandOptions = ref([]);
const farmLandList = ref([]);
const farmLandLoading = ref(false);
const farmLandRemoteMethod = async (query: string) => {
  if (query) {
    farmLandLoading.value = true;

    const res = await listFarmland({ pageNum: 1, pageSize: 10, id: query });
    farmLandList.value = res.rows;
    farmLandOptions.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.id}`
    }));
    farmLandLoading.value = false;
  } else {
    farmLandOptions.value = [];
  }
};
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;

    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query });
    productionSeasonList.value = res.rows;
    productionSeasonOptions.value = res.rows.map((item) => ({
      value: item.prodSeasonId,
      label: `${item.prodSeasonId}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

const productionSeasonOptionsFilter = ref([]);
const productionSeasonListFilter = ref([]);
const productionSeasonLoadingFilter = ref(false);
const productionSeasonRemoteMethodFilter = async (query: string) => {
  if (query) {
    productionSeasonListFilter.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.prodSeasonId?.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.prodSeasonId)
      )
    ];
    productionSeasonLoadingFilter.value = true;
    productionSeasonOptionsFilter.value = productionSeasonListFilter.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    productionSeasonLoadingFilter.value = false;
  } else {
    productionSeasonOptionsFilter.value = [];
  }
};

const getAllList = async () => {
  const res = await listWeatherIotData();
  productionSeasonAllList.value = res.rows ?? [];
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

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
  // deviceId: undefined,
  // dataQuality: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<WeatherIotDataForm, WeatherIotDataQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
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
    // deviceId: undefined,
    // dataQuality: undefined,
    deptId: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    weatherId: [{ required: true, message: 'Data ID cannot be empty', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
    timestamp: [{ required: true, message: 'Data Record Timestamp cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Weather & IoT Data List */
const getList = async () => {
  loading.value = true;
  const res = await listWeatherIotData(queryParams.value);
  weatherIotDataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Get current datetime string */
const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  form.value.timestamp = getCurrentDateTime();
  weatherIotDataFormRef.value?.resetFields();
};

/** Search Button Action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset Button Action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** Multi-select Change */
const handleSelectionChange = (selection: WeatherIotDataVO[]) => {
  ids.value = selection.map((item) => item.weatherId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'WeatherIotDataAdd' });
};

/** Edit Button Action */
const handleUpdate = (row?: WeatherIotDataVO) => {
  const _weatherId = row?.weatherId || ids.value[0];
  router.push({ name: 'WeatherIotDataEdit', params: { id: _weatherId } });
};

/** View Button Action */
const handleView = (row?: WeatherIotDataVO) => {
  const _weatherId = row?.weatherId || ids.value[0];
  router.push({ name: 'WeatherIotDataDetail', params: { id: _weatherId } });
};

/** Submit Button */
const submitForm = () => {
  weatherIotDataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Draft.toString();
      if (form.value.weatherId) {
        await updateWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWeatherIotData(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: WeatherIotDataVO) => {
  const _weatherIds = row?.weatherId || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Weather & IoT Data with ID "' + _weatherIds + '"?').finally(() => (loading.value = false));
  await delWeatherIotData(_weatherIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/weatherIotData/export',
    {
      ...queryParams.value
    },
    `weatherIotData_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  await getAllList();
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};
</script>

