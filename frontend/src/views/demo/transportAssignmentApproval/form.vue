<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="transportAssignmentFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="200px">
        <el-form-item label="Transport Task ID" prop="transportId">
          <el-input v-model="form.transportId" placeholder="Please enter Transport Task ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <el-select
            v-model="form.batchId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="batchIdRemoteMethod"
            :loading="batchIdLoading"
            :debounce="300"
            :disabled="true"
          >
            <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Transporter ID" prop="transporterId">
          <el-input v-model="form.transporterId" placeholder="Please enter Transporter ID" maxlength="20" show-word-limit :disabled="true" />
        </el-form-item>
        <el-form-item label="From Location" prop="fromLocation">
          <el-input v-model="form.fromLocation" placeholder="Please enter From Location" maxlength="150" show-word-limit :disabled="true" />
        </el-form-item>
        <el-form-item label="To Location" prop="toLocation">
          <el-input v-model="form.toLocation" placeholder="Please enter To Location" maxlength="150" show-word-limit :disabled="true" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Please select" :disabled="true">
            <el-option v-for="dict in transport_assignment_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Scheduled Date" prop="scheduledDate">
          <el-date-picker
            :disabled="true"
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
            :disabled="true"
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
            :disabled="true"
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
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != transportAssignmentStatus.Schedule.toString() && form.status != transportAssignmentStatus.InTransit.toString()"
          />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <div
            class="dialog-footer"
            v-if="
              form.status &&
              (form.status == transportAssignmentStatus.Schedule.toString() || form.status == transportAssignmentStatus.InTransit.toString())
            "
          >
            <el-button :loading="buttonLoading" type="primary" @click="inTransit">InTransit</el-button>
            <el-button :loading="buttonLoading" type="primary" @click="submitForm">Deliver</el-button>
            <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Cancel</el-button>
            <el-button @click="cancel">Close</el-button>
          </div>
          <div
            class="dialog-footer"
            v-if="form.status != transportAssignmentStatus.Schedule.toString() && form.status != transportAssignmentStatus.InTransit.toString()"
          >
            <el-button @click="cancel">Close</el-button>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="TransportAssignmentApprovalForm" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { addTransportAssignment, getTransportAssignment, updateTransportAssignment } from '@/api/demo/transportAssignment';
import { TransportAssignmentForm } from '@/api/demo/transportAssignment/types';
import { transportAssignmentStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { transport_assignment_status } = toRefs<any>(proxy?.useDict('transport_assignment_status'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const transportAssignmentFormRef = ref<ElFormInstance>();

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

const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
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
  approvedBy: undefined,
  approvedComment: undefined
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

/** Load record for detail/approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getTransportAssignment(id.value);
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

/** Submit Button - Deliver */
const submitForm = () => {
  transportAssignmentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = transportAssignmentStatus.Deliver.toString();
      if (form.value.id) {
        await updateTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  transportAssignmentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = transportAssignmentStatus.Cancel.toString();

      if (form.value.id) {
        await updateTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const inTransit = () => {
  transportAssignmentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = transportAssignmentStatus.InTransit.toString();

      if (form.value.id) {
        await updateTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
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
