<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
            <el-form-item label="IoT Environment Log ID" prop="logId">
              <el-select
                v-model="queryParams.logId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="logIdFilterRemoteMethod"
                :loading="logIdFilterLoading"
                :debounce="300"
              >
                <el-option v-for="item in logIdFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Warehouse Code" prop="warehouseCode">
              <!-- <el-input v-model="queryParams.farmerId" placeholder="Please enter Farmer ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.warehouseCode"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="warehouseFilterRemoteMethod"
                :loading="warehouseFilterLoading"
                :debounce="300"
              >
                <el-option v-for="item in warehouseFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Temperature" prop="temp">
              <el-input prefix-icon="Search" v-model="queryParams.temp" placeholder="Please enter Temperature" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Humidity" prop="humidity">
              <el-input v-model="queryParams.humidity" placeholder="Please enter Humidity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="CO2 Level" prop="co2Level">
              <el-input v-model="queryParams.co2Level" placeholder="Please enter CO2 Level" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Recorded At" prop="recordedAt">
              <el-date-picker
                clearable
                v-model="queryParams.recordedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Recorded At"
              >
              </el-date-picker>
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
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:iotEnvironmentLog:export']">Export</el-button>
          </el-col> --> 
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:iotEnvironmentLog:remove']">
              Delete
            </el-button>
          </el-col> -->
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:iotEnvironmentLog:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="iotEnvironmentLogList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('ID')" />
        <el-table-column label="IoT Environment Log ID" align="center" prop="logId" :min-width="getColumnWidth('IoT Environment Log ID')" />
        <el-table-column label="Warehouse Code" align="center" prop="warehouseCode" :min-width="getColumnWidth('Warehouse Code')"> </el-table-column>
        <el-table-column label="Sensor ID" align="center" prop="sensorId" :min-width="getColumnWidth('Sensor ID')" />
        <el-table-column label="Temperature" align="center" prop="temp" :min-width="getColumnWidth('Temperature')" />
        <el-table-column label="Humidity" align="center" prop="humidity" :min-width="getColumnWidth('Humidity')" />
        <el-table-column label="CO2 Level" align="center" prop="co2Level" :min-width="getColumnWidth('CO2 Level')" />
        <el-table-column label="Created Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['demo:iotEnvironmentLog:edit']"
              >Edit</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:iotEnvironmentLog:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit IoT Environment Log Dialog -->
  </div>
</template>

<script setup name="IotEnvironmentLog" lang="ts">
import {
  addIotEnvironmentLog,
  delIotEnvironmentLog,
  getIotEnvironmentLog,
  listIotEnvironmentLog,
  updateIotEnvironmentLog
} from '@/api/demo/iotEnvironmentLog';
import { IotEnvironmentLogForm, IotEnvironmentLogQuery, IotEnvironmentLogVO } from '@/api/demo/iotEnvironmentLog/types';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const iotEnvironmentLogList = ref<IotEnvironmentLogVO[]>([]);
/** 全量（大页）数据，供下拉/本地过滤等使用 */
const iotEnvironmentLogAllList = ref<IotEnvironmentLogVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const iotEnvironmentLogFormRef = ref<ElFormInstance>();

const warehouseIdOptions = ref([]);
const warehouseIdList = ref([]);
const warehouseIdAllList = ref<any[]>([]);
const warehouseIdLoading = ref(false);
const logIdFilterOptions = ref<{ value: string | number; label: string }[]>([]);
const logIdFilterList = ref<(string | number)[]>([]);
const logIdFilterLoading = ref(false);
const logIdFilterRemoteMethod = async (query: string) => {
  const q = query?.trim();
  if (!q) {
    logIdFilterOptions.value = [];
    logIdFilterList.value = [];
    return;
  }
  logIdFilterLoading.value = true;
  try {
    const lower = q.toLowerCase();
    logIdFilterList.value = [
      ...new Set(
        iotEnvironmentLogAllList.value
          .filter((f) => f.logId != null && String(f.logId).toLowerCase().includes(lower))
          .map((item) => item.logId as string | number)
      )
    ];
    logIdFilterOptions.value = logIdFilterList.value.map((lid) => ({
      value: lid,
      label: String(lid)
    }));
  } finally {
    logIdFilterLoading.value = false;
  }
};

const warehouseIdRemoteMethod = async (query: string) => {
  if (query) {
    warehouseIdLoading.value = true;
    warehouseIdList.value = warehouseIdAllList.value.filter((f: any) =>
      String(f.warehouseCode || f.warehouseId || f.warehouseName || f.id)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    warehouseIdOptions.value = warehouseIdList.value.map((item: any) => ({
      value: item.id,
      label: `${item.warehouseCode || item.warehouseId || item.warehouseName || item.id}`
    }));
    warehouseIdLoading.value = false;
  } else {
    warehouseIdOptions.value = [];
  }
};

const warehouseFilterOptions = ref([]);
const warehouseFilterList = ref([]);
const warehouseFilterLoading = ref(false);
const warehouseFilterRemoteMethod = async (query: string) => {
  const q = query?.trim();
  if (!q) {
    warehouseFilterOptions.value = [];
    warehouseFilterList.value = [];
    return;
  }
  warehouseFilterLoading.value = true;
  try {
    const lower = q.toLowerCase();
    warehouseFilterList.value = [
      ...new Set(
        iotEnvironmentLogAllList.value.filter((f) => String(f.warehouseCode).toLowerCase().includes(lower)).map((item) => item.warehouseCode)
      )
    ];
    warehouseFilterOptions.value = (warehouseFilterList.value as Array<string | number>).map((wid) => {
      return {
        value: wid,
        label: wid
      };
    });
  } finally {
    warehouseFilterLoading.value = false;
  }
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IotEnvironmentLogForm = {
  logId: undefined,
  warehouseId: undefined,
  warehouseCode: undefined,
  temp: undefined,
  humidity: undefined,
  co2Level: undefined,
  recordedAt: undefined,
  sensorId: undefined
};
const data = reactive<PageData<IotEnvironmentLogForm, IotEnvironmentLogQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    logId: undefined,
    warehouseId: undefined,
    warehouseCode: undefined,
    temp: undefined,
    humidity: undefined,
    co2Level: undefined,
    recordedAt: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    logId: [{ required: true, message: 'IoT Environment Log ID cannot be empty', trigger: 'blur' }],
    warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
    temp: [{ required: true, message: 'Temperature cannot be empty', trigger: 'blur' }],
    humidity: [{ required: true, message: 'Humidity cannot be empty', trigger: 'blur' }],
    co2Level: [{ required: true, message: 'CO2 Level cannot be empty', trigger: 'blur' }],
    recordedAt: [{ required: true, message: 'Recorded At cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || String(warehouseId || '');
};

const editForm = () => {
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId as string | number | undefined) || undefined;
};

const initWarehouseOptions = async () => {
  try {
    const res = await listExternalWarehouseList();
    const rows = (res as any)?.data?.rows || [];
    warehouseIdAllList.value = rows;
  } catch (error) {
    console.error('Failed to initialize warehouse options:', error);
  }
};

/** Query IoT Environment Log List */
const getList = async () => {
  loading.value = true;
  const res = await listIotEnvironmentLog(queryParams.value);
  iotEnvironmentLogList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 拉取全页数据（与列表页条件无关，用于本地缓存） */
const getAllList = async () => {
  try {
    const res = await listIotEnvironmentLog();
    iotEnvironmentLogAllList.value = res.rows || [];
  } catch (error) {
    console.error('getAllList failed:', error);
    iotEnvironmentLogAllList.value = [];
  }
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  iotEnvironmentLogFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IotEnvironmentLogVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'IotEnvironmentLogAdd' });
};

/** Edit Button Action */
const handleUpdate = (row?: IotEnvironmentLogVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'IotEnvironmentLogEdit', params: { id: _id } });
};

/** Submit Button */
const submitForm = () => {
  iotEnvironmentLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm();
      if ((form.value as any).id) {
        await updateIotEnvironmentLog(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addIotEnvironmentLog(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: IotEnvironmentLogVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the IoT Environment Log with ID "' + _ids + '"?').finally(() => (loading.value = false));
  await delIotEnvironmentLog(_ids);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/iotEnvironmentLog/export',
    {
      ...queryParams.value
    },
    `iotEnvironmentLog_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  try {
    await Promise.all([getList(), getAllList()]);
  } catch (error) {
    console.error('init failed:', error);
  }
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

