<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Loss Monitoring Dialog -->
      <el-form ref="lossMonitoringFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Loss Record ID" prop="lossId" v-if="form.id">
          <el-input v-model="form.lossId" placeholder="Please enter Loss Record ID" show-word-limit maxlength="20" :disabled="true" />
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <el-select
            v-if="!isViewFlag(form)"
            v-model="form.batchId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="Please input"
            :remote-method="batchIdRemoteMethod"
            :loading="batchIdLoading"
            :debounce="300"
          >
            <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.batchId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Warehouse Code" prop="warehouseId">
          <el-select
            v-if="!isViewFlag(form)"
            v-model="form.warehouseId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="Please input"
            :remote-method="warehouseIdRemoteMethod"
            :loading="warehouseIdLoading"
            :debounce="300"
          >
            <el-option v-for="item in warehouseIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.warehouseCode" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Loss Type" prop="type">
          <el-select v-model="form.type" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in loss_monitoring_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Loss Quantity" prop="qty">
          <el-input-number
            v-model="form.qty"
            placeholder="Please enter Loss Quantity"
            style="width: 100%"
            :min="0"
            :max="99999999.99"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Loss Cause" prop="cause">
          <el-input v-model="form.cause" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Reported At" prop="reportedAt">
          <el-date-picker
            clearable
            v-model="form.reportedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Reported At"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <template v-if="!isDetail">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm" v-if="!form.id">Save</el-button>
          <el-button
            :loading="buttonLoading"
            type="primary"
            @click="Confirmed"
            v-if="form.id && form.status !== LossMonitoringStatus.Confirmed.toString()"
            >Confirmed</el-button
          >
          <el-button @click="cancel">Cancel</el-button>
        </template>
        <el-button v-else @click="cancel">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="LossMonitoringForm" lang="ts">
import { addLossMonitoring, getLossMonitoring, updateLossMonitoring } from '@/api/demo/lossMonitoring';
import { LossMonitoringForm } from '@/api/demo/lossMonitoring/types';
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import { LossMonitoringStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { loss_monitoring_type } = toRefs<any>(proxy?.useDict('loss_monitoring_type'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const lossMonitoringFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const warehouseIdOptions = ref([]);
const warehouseIdList = ref([]);
const warehouseIdAllList = ref<any[]>([]);
const warehouseIdLoading = ref(false);

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

const batchIdOptions = ref([]);
const batchIdList = ref([]);
const batchIdLoading = ref(false);
const batchIdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdLoading.value = true;
    const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query });
    batchIdList.value = res.rows;
    batchIdOptions.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.batchId}`
    }));
    batchIdLoading.value = false;
  } else {
    batchIdOptions.value = [];
  }
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

const initFormData: LossMonitoringForm = {
  id: undefined,
  lossId: undefined,
  batchId: undefined,
  type: undefined,
  qty: undefined,
  cause: undefined,
  reportedAt: undefined,
  warehouseId: undefined,
  status: LossMonitoringStatus.Draft.toString()
};

const form = ref<LossMonitoringForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
  lossId: [{ required: true, message: 'Loss Record ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  type: [{ required: true, message: 'Loss Type (Spoilage/Pest/Shrinkage/Breakage) cannot be empty', trigger: 'change' }],
  qty: [{ required: true, message: 'Loss Quantity cannot be empty', trigger: 'blur' }],
  cause: [{ required: true, message: 'Loss Cause cannot be empty', trigger: 'blur' }],
  reportedAt: [{ required: true, message: 'Reported At cannot be empty', trigger: 'blur' }]
};

const isViewFlag = (data: { status?: string | number }) => {
  return data && data.status === LossMonitoringStatus.Confirmed.toString();
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getLossMonitoring(id.value);
    Object.assign(form.value, res.data);

    // 使用表格行里的名称，保证下拉框显示 name 而不是纯 ID
    const current: any = res.data || {};
    if (form.value.batchId) {
      batchIdOptions.value = [
        {
          value: form.value.batchId,
          label: current.batchName || String(form.value.batchId)
        }
      ];
    }
    if (form.value.warehouseId) {
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
  lossMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();
      form.value.status = LossMonitoringStatus.Draft.toString();
      if (form.value.id) {
        await updateLossMonitoring(form.value);
      } else {
        await addLossMonitoring(form.value);
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const Confirmed = () => {
  lossMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();
      form.value.status = LossMonitoringStatus.Confirmed.toString();
      if (form.value.id) {
        await updateLossMonitoring(form.value);
      } else {
        await addLossMonitoring(form.value);
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
