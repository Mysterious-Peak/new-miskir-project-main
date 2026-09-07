<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="vehicleFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Vehicle Id" prop="vehicleId">
          <el-input v-model="form.vehicleId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Provider Id" prop="providerId">
          <el-input v-model="form.providerId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Vehicle Registration Plate" prop="plateNumber">
          <el-input v-model="form.plateNumber" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Vehicle Type" prop="vehicleType">
          <el-select v-model="form.vehicleType" placeholder="Please select" disabled>
            <el-option v-for="dict in vehicle_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Cold Chain Capability" prop="coldChainCapable">
          <el-select v-model="form.coldChainCapable" placeholder="Please select" disabled>
            <el-option v-for="dict in cold_chain_capable" :key="dict.value" :label="dict.label" :value="Number(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Created By" prop="createdUserName">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Creation Date" prop="createTime">
          <el-date-picker clearable v-model="form.createTime" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != VehicleInfoStatus.Draft.toString()"
          />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <div class="dialog-footer" v-if="form.status && form.status == VehicleInfoStatus.Draft.toString()">
            <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
            <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
            <el-button :loading="buttonLoading" type="warning" @click="revisionForm">Need Revision</el-button>
            <el-button @click="cancel">Cancel</el-button>
          </div>
          <div class="dialog-footer" v-if="form.status != VehicleInfoStatus.Draft.toString()">
            <el-button @click="cancel">Close</el-button>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="VehicleApprovalForm" lang="ts">
import { addVehicle, getVehicle, updateVehicle } from '@/api/demo/vehicle';
import { VehicleForm } from '@/api/demo/vehicle/types';
import { VehicleInfoStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { vehicle_type, cold_chain_capable } = toRefs<any>(proxy?.useDict('vehicle_type', 'cold_chain_capable'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const vehicleFormRef = ref<ElFormInstance>();

const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: VehicleForm = {
  vehicleId: undefined,
  providerId: undefined,
  plateNumber: undefined,
  vehicleType: undefined,
  coldChainCapable: undefined,
  status: undefined
};

const form = ref<VehicleForm>({ ...initFormData });

const rules = {
  providerId: [{ required: true, message: 'Provider Id cannot be empty', trigger: 'blur' }],
  plateNumber: [{ required: true, message: 'Vehicle Registration Plate cannot be empty', trigger: 'blur' }],
  vehicleType: [{ required: true, message: 'Vehicle Type cannot be empty', trigger: 'change' }],
  coldChainCapable: [{ required: true, message: 'Cold Chain Capability cannot be empty', trigger: 'blur' }]
};

/** Load record for detail/approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getVehicle(id.value);
    Object.assign(form.value, res.data);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel / Close Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button - Approval */
const submitForm = () => {
  vehicleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = VehicleInfoStatus.Approved.toString();

      if (form.value.vehicleId) {
        await updateVehicle(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addVehicle(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  vehicleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = VehicleInfoStatus.Rejected.toString();

      if (form.value.vehicleId) {
        await updateVehicle(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addVehicle(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const revisionForm = () => {
  vehicleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = VehicleInfoStatus.NeedRevision.toString();

      if (form.value.vehicleId) {
        await updateVehicle(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addVehicle(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
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
