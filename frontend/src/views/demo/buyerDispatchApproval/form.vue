<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="buyerDispatchFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="150px">
        <el-form-item label="Dispatch ID" prop="dispatchId">
          <el-input v-model="form.dispatchId" placeholder="Please enter Dispatch ID" maxlength="20" show-word-limit :disabled="true" />
        </el-form-item>
        <el-form-item label="Warehouse Code" prop="warehouseId">
          <el-input :model-value="getWarehouseCodeById(form.warehouseId)" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <el-select
            v-model="form.batchId"
            filterable
            remote
            :disabled="true"
            reserve-keyword
            placeholder="Please input"
            :remote-method="batchIdRemoteMethod"
            :loading="batchIdLoading"
            :debounce="300"
          >
            <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Buyer Name" prop="buyer">
          <el-input v-model="form.buyer" placeholder="Please enter Buyer Name" maxlength="100" show-word-limit :disabled="true" />
        </el-form-item>
        <el-form-item label="Dispatch Quantity" prop="qty">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="99999999.99"
            v-model="form.qty"
            placeholder="Please enter Dispatch Quantity"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="Dispatch Date" prop="dispatchDate">
          <el-date-picker
            clearable
            v-model="form.dispatchDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Dispatch Date"
            :disabled="true"
          >
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Please select" :disabled="true">
            <el-option v-for="dict in buyer_dispatch_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != buyerStatus.Schedule.toString()"
          />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <div class="dialog-footer" v-if="form.status && form.status == buyerStatus.Schedule.toString()">
            <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approved</el-button>
            <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Cancel</el-button>
            <!-- <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button> -->
            <el-button @click="cancel">Close</el-button>
          </div>
          <div class="dialog-footer" v-if="form.status != buyerStatus.Schedule.toString()">
            <el-button @click="cancel">Close</el-button>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="BuyerDispatchApprovalForm" lang="ts">
import { addBuyerDispatch, getBuyerDispatch, updateBuyerDispatch } from '@/api/demo/buyerDispatch';
import { BuyerDispatchForm } from '@/api/demo/buyerDispatch/types';
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import { buyerStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const buyerDispatchFormRef = ref<ElFormInstance>();

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

const warehouseIdAllList = ref<any[]>([]);

const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || '';
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

const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
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
  approvedComment: undefined
};

const form = ref<BuyerDispatchForm>({ ...initFormData });

const editForm = () => {
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId as string | number) || undefined;
};

const rules = {
  id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
  dispatchId: [{ required: true, message: 'Dispatch ID cannot be empty', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  buyer: [{ required: true, message: 'Buyer Name cannot be empty', trigger: 'blur' }],
  qty: [{ required: true, message: 'Dispatch Quantity cannot be empty', trigger: 'blur' }],
  dispatchDate: [{ required: true, message: 'Dispatch Date cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status (Dispatched/Completed/Cancelled) cannot be empty', trigger: 'change' }]
};

/** Load record for detail/approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getBuyerDispatch(id.value);
    const rowData: any = res.data;
    Object.assign(form.value, rowData);

    // 使用记录里的批次名称，保证下拉框显示 name 而不是纯 ID
    if (form.value.batchId) {
      batchIdOptions.value = [
        {
          value: form.value.batchId,
          label: rowData.batchName || String(form.value.batchId)
        }
      ];
    }
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel / Close Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button - Approved */
const submitForm = () => {
  buyerDispatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm();
      form.value.status = buyerStatus.Approved.toString();
      if (form.value.id) {
        await updateBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  buyerDispatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = buyerStatus.Cancel.toString();

      if (form.value.id) {
        await updateBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

onMounted(async () => {
  try {
    await Promise.all([loadRecord(), initWarehouseOptions()]);
  } catch (error) {
    console.error('init failed:', error);
  }
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
