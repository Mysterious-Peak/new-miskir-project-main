<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="buyerDispatchFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="150px">
        <el-form-item label="Dispatch ID" prop="dispatchId" v-if="form.id">
          <el-input v-model="form.dispatchId" placeholder="Please enter Dispatch ID" maxlength="20" show-word-limit :disabled="true" />
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
            :disabled="isDetail"
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
            :disabled="isDetail"
          >
            <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Buyer Name" prop="buyer">
          <el-input v-model="form.buyer" placeholder="Please enter Buyer Name" maxlength="100" show-word-limit :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="Dispatch Quantity" prop="qty">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="99999999.99"
            v-model="form.qty"
            placeholder="Please enter Dispatch Quantity"
            :disabled="isDetail"
          />
        </el-form-item>
        <el-form-item label="Dispatch Date" prop="dispatchDate">
          <el-date-picker
            :disabled="isDetail"
            clearable
            v-model="form.dispatchDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Dispatch Date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Status" prop="status" style="display: none">
          <el-select v-model="form.status" placeholder="Please select" :disabled="isDetail">
            <el-option v-for="dict in buyer_dispatch_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
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

<script setup name="BuyerDispatchForm" lang="ts">
import { addBuyerDispatch, getBuyerDispatch, updateBuyerDispatch } from '@/api/demo/buyerDispatch';
import { BuyerDispatchForm } from '@/api/demo/buyerDispatch/types';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import request from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const buyerDispatchFormRef = ref<ElFormInstance>();

const { buyer_dispatch_status } = toRefs<any>(proxy?.useDict('buyer_dispatch_status'));

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: BuyerDispatchForm = {
  id: undefined,
  dispatchId: undefined,
  batchId: undefined,
  buyer: undefined,
  qty: undefined,
  dispatchDate: undefined,
  status: undefined,
  warehouseId: undefined
};

const form = ref<BuyerDispatchForm>({ ...initFormData });

const rules = {
  // dispatchId: [{ required: true, message: 'Dispatch ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
  buyer: [{ required: true, message: 'Buyer Name cannot be empty', trigger: 'blur' }],
  qty: [{ required: true, message: 'Dispatch Quantity cannot be empty', trigger: 'blur' }],
  dispatchDate: [{ required: true, message: 'Dispatch Date cannot be empty', trigger: 'blur' }],
  status: [{ required: false, message: 'Status (Dispatched/Completed/Cancelled) cannot be empty', trigger: 'change' }]
};

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
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId as string | number) || undefined;
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

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    // Set default status to first option
    if (buyer_dispatch_status.value && buyer_dispatch_status.value.length > 0) {
      form.value.status = buyer_dispatch_status.value[0].value;
    }
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getBuyerDispatch(id.value);
    Object.assign(form.value, res.data);
    // 使用记录里的名称，保证下拉框显示 name 而不是纯 ID
    if (form.value.warehouseId) {
      const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(form.value.warehouseId));
      warehouseIdOptions.value = [
        {
          value: form.value.warehouseId,
          label: matched?.warehouseCode || String(form.value.warehouseId)
        }
      ];
    }
    if (form.value.batchId) {
      batchIdOptions.value = [
        {
          value: form.value.batchId,
          label: String(form.value.batchId)
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
  // status is hidden in UI, so ensure a default before validation.
  buyerDispatchFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();
      if (form.value.id) {
        await updateBuyerDispatch(form.value);
      } else {
        await addBuyerDispatch(form.value);
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
