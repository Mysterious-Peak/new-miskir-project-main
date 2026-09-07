<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="warehouseIntakeFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Intake ID" prop="intakeId" v-show="isShow">
          <el-input v-model="form.intakeId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <!-- <div v-if="!isViewFlag(form)" class="flex gap-2 flex-1">
            <el-input v-model="form.batchId" placeholder="Please input" disabled />
            <SelectPostHarvestBatch v-model="form.batchId" :status="PostHarvestBatchStatus.Inspected.toString()"></SelectPostHarvestBatch>
          </div> -->
          <el-select
            v-model="form.batchId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="batchIdRemoteMethod"
            :loading="batchIdLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.batchName" placeholder="Please input" disabled />
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
            reserve-keyword
            placeholder="Please input"
            :remote-method="warehouseIdRemoteMethod"
            :loading="warehouseIdLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in warehouseIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.warehouseCode" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Quantity" prop="qty">
          <el-input-number
            v-model="form.qty"
            placeholder="Please input"
            :min="0"
            :max="99999999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <!-- <el-form-item label="Intake Date" prop="intakeDate" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.intakeDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item> -->
        <el-form-item label="Created By" prop="createdUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Created Date" prop="createTime" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
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

<script setup name="WarehouseIntakeForm" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { addWarehouseIntake, getWarehouseIntake, listExternalWarehouseList, updateWarehouseIntake } from '@/api/demo/warehouseIntake';
import { WarehouseIntakeForm } from '@/api/demo/warehouseIntake/types';
import { ApprovalStatus, PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const warehouseIntakeFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const isShow = computed(() => {
  return !isAdd.value;
});

const initFormData: WarehouseIntakeForm = {
  id: undefined,
  intakeId: undefined,
  batchId: undefined,
  warehouseId: undefined,
  warehouseCode: undefined,
  qty: undefined,
  intakeDate: undefined,
  createdUserName: undefined,
  createTime: undefined,
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedAt: undefined,
  approvedComment: undefined,
  status: ApprovalStatus.Draft.toString()
};

const form = ref<WarehouseIntakeForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
  // intakeId: [{ required: true, message: 'Intake ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
  qty: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }]
  // intakeDate: [{ required: true, message: '入库操作日期时间不能为空', trigger: 'blur' }],
  // approvedBy: [{ required: true, message: '审批人用户ID不能为空', trigger: 'blur' }]
};

const batchIdOptions = ref([]);
const batchIdList = ref([]);
const batchIdLoading = ref(false);
const batchIdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdLoading.value = true;
    const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query, status: PostHarvestBatchStatus.Inspected.toString() });
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

const warehouseIdOptions = ref([]);
const warehouseIdList = ref([]);
const warehouseIdLoading = ref(false);
const warehouseIdRemoteMethod = async (query: string) => {
  if (query) {
    warehouseIdLoading.value = true;
    warehouseIdList.value = warehouseIdAllList.value.filter((f) => f.warehouseCode.toLowerCase().includes(query.toLowerCase()));
    warehouseIdOptions.value = warehouseIdList.value.map((item) => ({
      value: item.id,
      label: item.warehouseCode
    }));
    warehouseIdLoading.value = false;
  } else {
    warehouseIdOptions.value = [];
  }
};

/**
 * 初始化时调用外部仓库列表接口，预加载仓库下拉数据
 */
const warehouseIdAllList = ref<any[]>([]);
const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || '';
};

const editForm = () => {
  form.value.status = ApprovalStatus.Draft.toString();
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId);
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

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getWarehouseIntake(id.value);
    Object.assign(form.value, res.data);

    if (!isViewFlag(form.value)) {
      {
        batchIdLoading.value = true;
        const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, id: form.value.batchId });
        batchIdList.value = res.rows;
        batchIdOptions.value = res.rows.map((item) => ({
          value: item.id.toString(),
          label: `${item.batchId}`
        }));
        batchIdLoading.value = false;
      }

      {
        warehouseIdLoading.value = true;
        warehouseIdOptions.value = warehouseIdAllList.value.map((item: any) => ({
          value: item.id,
          label: item.warehouseCode
        }));
        warehouseIdLoading.value = false;
      }
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
  warehouseIntakeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();
      if (form.value.id) {
        await updateWarehouseIntake(form.value);
      } else {
        await addWarehouseIntake(form.value);
      }
      proxy?.$modal.msgSuccess('success');
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
