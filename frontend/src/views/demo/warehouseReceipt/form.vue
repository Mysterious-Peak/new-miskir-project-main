<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Warehouse Receipt Dialog -->
      <el-form ref="warehouseReceiptFormRef" :model="form" :rules="rules" label-width="200px">
        <el-form-item label="Warehouse Receipt ID" prop="receiptId" v-if="form.id">
          <el-input v-model="form.receiptId" placeholder="Please enter Warehouse Receipt ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Warehouse Code" prop="warehouseId">
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
            :disabled="isViewFlag(form)"
            @change="handleWarehouseChange"
          >
            <el-option v-for="item in warehouseIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <el-select
            v-model="form.batchId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="Please input"
            :remote-method="batchIdRemoteMethod"
            :loading="batchIdLoading"
            :debounce="300"
            :disabled="isViewFlag(form)"
          >
            <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Quantity" prop="qty">
          <el-input v-model="form.qty" placeholder="Please enter Quantity" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Estimated Value (ETB)" prop="valueEtb">
          <el-input v-model="form.valueEtb" placeholder="Please enter Estimated Value (ETB)" :disabled="isViewFlag(form)" />
        </el-form-item>
        <!-- <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Please select">
            <el-option v-for="dict in warehouse_receipt_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button v-if="isViewFlag(form)" @click="cancel">Close</el-button>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="WarehouseReceiptForm" lang="ts">
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import { addWarehouseReceipt, getWarehouseReceipt, updateWarehouseReceipt } from '@/api/demo/warehouseReceipt';
import { WarehouseReceiptForm } from '@/api/demo/warehouseReceipt/types';
import { PledgedStatus } from '@/enums/AgriculturalEnum';
import request from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const warehouseReceiptFormRef = ref<ElFormInstance>();

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
    const warehouseCode =
      String(form.value.warehouseCode || '').trim() || getWarehouseCodeById(form.value.warehouseId as string | number | undefined);
    if (!warehouseCode) {
      batchIdOptions.value = [];
      batchIdList.value = [];
      return;
    }
    batchIdLoading.value = true;
    try {
      const res = await request({
        url: '/demo/postharvestBatch/verifyStoredAndApproved',
        method: 'get',
        params: {
          batchId: query,
          warehouseCode
        }
      });
      const verifiedBatchList = Array.isArray((res as any)?.data) ? (res as any).data : [];
      if (!verifiedBatchList.length) {
        batchIdList.value = [];
        batchIdOptions.value = [];
        return;
      }
      batchIdList.value = verifiedBatchList;
      batchIdOptions.value = verifiedBatchList.map((item: any) => ({
        value: item.id,
        label: `${item.batchId}`
      }));
    } finally {
      batchIdLoading.value = false;
    }
  } else {
    batchIdOptions.value = [];
    batchIdList.value = [];
  }
};

const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || String(warehouseId || '');
};

const editForm = () => {
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId as string | number | undefined) || undefined;
};

const handleWarehouseChange = (warehouseId: string | number | undefined) => {
  form.value.warehouseCode = getWarehouseCodeById(warehouseId) || undefined;
  form.value.batchId = undefined;
  batchIdOptions.value = [];
  batchIdList.value = [];
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

const initFormData: WarehouseReceiptForm = {
  id: undefined,
  receiptId: undefined,
  batchId: undefined,
  warehouseId: undefined,
  qty: undefined,
  valueEtb: undefined,
  approvedComment: undefined
};

const form = ref<WarehouseReceiptForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
  receiptId: [{ required: true, message: 'Warehouse Receipt ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
  qty: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }],
  valueEtb: [{ required: true, message: 'Estimated Value (ETB) cannot be empty', trigger: 'blur' }]
};

const isViewFlag = (data) => {
  return data.status == PledgedStatus.Rejected || data.status == PledgedStatus.Canceled;
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getWarehouseReceipt(id.value);
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
  warehouseReceiptFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();
      if (form.value.id) {
        await updateWarehouseReceipt(form.value);
      } else {
        await addWarehouseReceipt(form.value);
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
