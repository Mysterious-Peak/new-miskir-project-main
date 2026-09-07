<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit IoT Environment Log Dialog -->
      <el-form ref="iotEnvironmentLogFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="180">
        <el-form-item label="IoT Environment Log ID" prop="logId" v-if="form.logId">
          <el-input v-model="form.logId" placeholder="Please enter IoT Environment Log ID" :disabled="true" />
        </el-form-item>
        <el-form-item label="Warehouse Code" prop="warehouseId">
          <!-- <div v-if="!isViewFlag(form)" class="flex gap-2 flex-1">
            <el-input v-model="form.warehouseId" placeholder="Please input" disabled />
            <SelectWarehouse v-model="form.warehouseId"></SelectWarehouse>
          </div> -->
          <el-select
            v-model="form.warehouseId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="Please input"
            :remote-method="warehouseIdRemoteMethod"
            :loading="warehouseIdLoading"
            :debounce="300"
            v-if="true"
          >
            <el-option v-for="item in warehouseIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.warehouseId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Sensor ID" prop="sensorId">
          <el-input v-model="form.sensorId" placeholder="Please enter Sensor ID" style="width: 100%" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Temperature" prop="temp">
          <el-input-number v-model="form.temp" placeholder="Please enter Temperature" style="width: 100%" :min="0" :max="999.99" />
        </el-form-item>
        <el-form-item label="Humidity" prop="humidity">
          <el-input-number v-model="form.humidity" placeholder="Please enter Humidity" style="width: 100%" :min="0" :max="999.99" />
        </el-form-item>
        <el-form-item label="CO2 Level" prop="co2Level">
          <el-input-number v-model="form.co2Level" placeholder="Please enter CO2 Level" style="width: 100%" :min="0" :max="999.99" />
        </el-form-item>
        <el-form-item label="Recorded At" prop="recordedAt">
          <el-date-picker
            clearable
            v-model="form.recordedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Recorded At"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="IotEnvironmentLogForm" lang="ts">
import { addIotEnvironmentLog, getIotEnvironmentLog, updateIotEnvironmentLog } from '@/api/demo/iotEnvironmentLog';
import { IotEnvironmentLogForm } from '@/api/demo/iotEnvironmentLog/types';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const iotEnvironmentLogFormRef = ref<ElFormInstance>();

const warehouseIdOptions = ref([]);
const warehouseIdAllList = ref<any[]>([]);
const warehouseIdLoading = ref(false);

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<IotEnvironmentLogForm>({ ...initFormData });

const rules = {
  logId: [{ required: true, message: 'IoT Environment Log ID cannot be empty', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
  temp: [{ required: true, message: 'Temperature cannot be empty', trigger: 'blur' }],
  humidity: [{ required: true, message: 'Humidity cannot be empty', trigger: 'blur' }],
  co2Level: [{ required: true, message: 'CO2 Level cannot be empty', trigger: 'blur' }],
  recordedAt: [{ required: true, message: 'Recorded At cannot be empty', trigger: 'blur' }]
};

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

const warehouseIdRemoteMethod = async (query: string) => {
  if (query) {
    warehouseIdLoading.value = true;
    const warehouseIdList = warehouseIdAllList.value.filter((f: any) =>
      String(f.warehouseCode || f.warehouseId || f.warehouseName || f.id)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    warehouseIdOptions.value = warehouseIdList.map((item: any) => ({
      value: item.id,
      label: `${item.warehouseCode || item.warehouseId || item.warehouseName || item.id}`
    }));
    warehouseIdLoading.value = false;
  } else {
    warehouseIdOptions.value = [];
  }
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getIotEnvironmentLog(id.value);
    Object.assign(form.value, res.data);

    // 使用记录里的名称，保证下拉框显示 name 而不是纯 ID
    const current: any = res.data || {};
    if (current && form.value.warehouseId) {
      const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(form.value.warehouseId));
      warehouseIdOptions.value = [
        {
          value: form.value.warehouseId,
          label: matched?.warehouseCode || current.warehouseCode || current.warehouseName || String(form.value.warehouseId)
        }
      ];
    }
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
const submitForm = () => {
  iotEnvironmentLogFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();
      if (isEdit.value) {
        await updateIotEnvironmentLog(form.value);
      } else {
        await addIotEnvironmentLog(form.value);
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(async () => {
  await initWarehouseOptions();
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
</style>
