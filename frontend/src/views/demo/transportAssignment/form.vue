<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="transportAssignmentFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="200px">
        <el-form-item label="Transport Task ID" prop="transportId" v-if="form.id">
          <el-input v-model="form.transportId" placeholder="Please enter Transport Task ID" maxlength="20" show-word-limit :disabled="true" />
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
        <!-- <el-form-item label="Transporter ID" prop="transporterId">
          <el-input v-model="form.transporterId" placeholder="Please enter Transporter ID" maxlength="20" show-word-limit />
        </el-form-item> -->
        <el-form-item label="Transporter ID" prop="transporterId">
          <el-select
            v-model="form.transporterId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="TransporterRemoteMethod"
            :loading="TransporterLoading"
            :debounce="300"
            :disabled="isDetail"
          >
            <el-option v-for="item in TransporterOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="From Location" prop="fromLocation">
          <el-input
            v-model="form.fromLocation"
            placeholder="Please enter From Location"
            maxlength="150"
            show-word-limit
            :disabled="isDetail"
          />
        </el-form-item>
        <el-form-item label="To Location" prop="toLocation">
          <el-input v-model="form.toLocation" placeholder="Please enter To Location" maxlength="150" show-word-limit :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="Status" prop="status" style="display: none">
          <el-select v-model="form.status" placeholder="Please select" :disabled="isDetail">
            <el-option v-for="dict in transport_assignment_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Scheduled Date" prop="scheduledDate">
          <el-date-picker
            :disabled="isDetail"
            clearable
            v-model="form.scheduledDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Scheduled Date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Actual Departure" prop="actualDeparture">
          <el-date-picker
            :disabled="isDetail"
            clearable
            v-model="form.actualDeparture"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Actual Departure"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Actual Arrival" prop="actualArrival">
          <el-date-picker
            :disabled="isDetail"
            clearable
            v-model="form.actualArrival"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Actual Arrival"
          >
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="Approved By" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="Please enter Approved By" />
        </el-form-item> -->
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

<script setup name="TransportAssignmentForm" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { getTransportAssignment, addTransportAssignment, updateTransportAssignment } from '@/api/demo/transportAssignment';
import { TransportAssignmentForm } from '@/api/demo/transportAssignment/types';
import { listTransporterMaster } from '@/api/demo/transporterMaster';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const transportAssignmentFormRef = ref<ElFormInstance>();

const { transport_assignment_status } = toRefs<any>(proxy?.useDict('transport_assignment_status'));

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: TransportAssignmentForm = {
  id: undefined,
  transportId: undefined,
  batchId: undefined,
  transporterId: undefined,
  fromLocation: undefined,
  toLocation: undefined,
  status: undefined,
  scheduledDate: undefined,
  actualDeparture: undefined,
  actualArrival: undefined,
  approvedBy: undefined
};

const form = ref<TransportAssignmentForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
  transportId: [{ required: true, message: 'Transport Task ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  transporterId: [{ required: true, message: 'Transporter ID cannot be empty', trigger: 'blur' }],
  fromLocation: [{ required: true, message: 'From Location cannot be empty', trigger: 'blur' }],
  toLocation: [{ required: true, message: 'To Location cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status (Scheduled/InTransit/Delivered/Cancelled) cannot be empty', trigger: 'change' }],
  scheduledDate: [{ required: true, message: 'Scheduled Date cannot be empty', trigger: 'blur' }],
  approvedBy: [{ required: true, message: 'Approved By cannot be empty', trigger: 'blur' }]
};

const TransporterOptions = ref([]);
const TransporterLoading = ref(false);
const TransporterRemoteMethod = async (query: string) => {
  if (query) {
    TransporterLoading.value = true;
    const res = await listTransporterMaster({ pageNum: 1, pageSize: 10, id: query });
    TransporterOptions.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.id}`
    }));
    TransporterLoading.value = false;
  } else {
    TransporterOptions.value = [];
  }
};

const batchIdOptions = ref([]);
const batchIdLoading = ref(false);
const batchIdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdLoading.value = true;
    const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query });
    batchIdOptions.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.batchId}`
    }));
    batchIdLoading.value = false;
  } else {
    batchIdOptions.value = [];
  }
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData, status: '0' };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getTransportAssignment(id.value);
    Object.assign(form.value, res.data);
    // 使用记录里的批次ID，保证下拉框显示 name 而不是纯 ID
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
  transportAssignmentFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      // Set default status to '0' if not set
      if (!form.value.status) {
        form.value.status = '0';
      }
      if (form.value.id) {
        await updateTransportAssignment(form.value);
      } else {
        await addTransportAssignment(form.value);
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
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
