<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="driverFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Driver Id" prop="driverId">
          <el-input v-model="form.driverId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Provider Id" prop="providerId">
          <el-input v-model="form.providerId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Driver license number" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Contact phone number" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="Please input" disabled />
        </el-form-item>

        <el-form-item label="Created By" prop="createdUserName">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Created Time" prop="createTime">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
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
            :disabled="form.status != DriverInfoStatus.Draft.toString()"
          />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <div class="dialog-footer" v-if="form.status && form.status == DriverInfoStatus.Draft.toString()">
            <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
            <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
            <el-button :loading="buttonLoading" type="warning" @click="revisionForm">Need Revision</el-button>
            <el-button @click="cancel">Cancel</el-button>
          </div>
          <div class="dialog-footer" v-if="form.status != DriverInfoStatus.Draft.toString()">
            <el-button @click="cancel">Close</el-button>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="DriverApprovalForm" lang="ts">
import { addDriver, getDriver, updateDriver } from '@/api/demo/driver';
import { DriverForm } from '@/api/demo/driver/types';
import { DriverInfoStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const driverFormRef = ref<ElFormInstance>();

const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: DriverForm = {
  driverId: undefined,
  providerId: undefined,
  licenseNumber: undefined,
  phoneNumber: undefined,
  status: undefined
};

const form = ref<DriverForm>({ ...initFormData });

const rules = {
  providerId: [{ required: true, message: 'Provider Id cannot be empty', trigger: 'blur' }],
  licenseNumber: [{ required: true, message: 'Driver license number cannot be empty', trigger: 'blur' }]
};

/** Load record for detail/approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getDriver(id.value);
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
  driverFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = DriverInfoStatus.Approved.toString();

      if (form.value.driverId) {
        await updateDriver(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDriver(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  driverFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = DriverInfoStatus.Rejected.toString();

      if (form.value.driverId) {
        await updateDriver(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDriver(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const revisionForm = () => {
  driverFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = DriverInfoStatus.NeedRevision.toString();

      if (form.value.driverId) {
        await updateDriver(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDriver(form.value).finally(() => (buttonLoading.value = false));
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
