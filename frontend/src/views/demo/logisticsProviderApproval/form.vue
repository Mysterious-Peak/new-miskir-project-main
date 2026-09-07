<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="logisticsProviderFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="200px">
        <el-form-item label="Provider ID" prop="providerId" v-if="form.providerId">
          <el-input v-model="form.providerId" placeholder="Please enter Provider ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Provider business name" prop="providerName">
          <el-input v-model="form.providerName" placeholder="Please enter Provider business name" :disabled="true" />
        </el-form-item>
        <el-form-item label="Transport license number" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" placeholder="Please enter Transport license number" :disabled="true" />
        </el-form-item>
        <el-form-item label="Number of vehicles in fleet" prop="fleetSize">
          <el-input-number
            v-model="form.fleetSize"
            style="width: 100%"
            :min="0"
            :max="1000"
            placeholder="Please enter Number of vehicles in fleet"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="Operating region" prop="region">
          <el-select v-model="form.region" placeholder="Please select Operating region" :disabled="true" clearable>
            <el-option v-for="dict in region" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <div class="dialog-footer">
            <!-- Draft状态：显示Approved / NeedRevision / Rejected按钮 -->
            <el-button
              :loading="buttonLoading"
              type="warning"
              @click="needRevisionForm"
              v-if="!isViewFlag(form) && form.status == logisticsProviderStatus.Draft.toString()"
              >NeedRevision</el-button
            >
            <el-button
              :loading="buttonLoading"
              type="primary"
              @click="submitForm"
              v-if="!isViewFlag(form) && form.status == logisticsProviderStatus.Draft.toString()"
              >Approved</el-button
            >
            <el-button
              :loading="buttonLoading"
              type="danger"
              @click="rejectStatusForm"
              v-if="!isViewFlag(form) && form.status == logisticsProviderStatus.Draft.toString()"
              >Rejected</el-button
            >
            <!-- 可编辑状态下的Close按钮 -->
            <el-button @click="cancel" v-if="!isViewFlag(form)">Close</el-button>
          </div>
          <div class="dialog-footer">
            <!-- 查看状态下的Close按钮 -->
            <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="LogisticsProviderApprovalForm" lang="ts">
import { addLogisticsProvider, getLogisticsProvider, updateLogisticsProvider } from '@/api/demo/logisticsProvider';
import { LogisticsProviderForm } from '@/api/demo/logisticsProvider/types';
import { logisticsProviderStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { region } = toRefs<any>(proxy?.useDict('region'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const logisticsProviderFormRef = ref<ElFormInstance>();

const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: LogisticsProviderForm = {
  providerId: undefined,
  providerName: undefined,
  licenseNumber: undefined,
  fleetSize: undefined,
  region: undefined,
  status: logisticsProviderStatus.Draft.toString(),
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};

const form = ref<LogisticsProviderForm>({ ...initFormData });

const rules = {
  providerId: [{ required: true, message: 'Unique provider identifier cannot be empty', trigger: 'blur' }],
  providerName: [{ required: true, message: 'Provider business name cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Draft=0 / Approved=1 cannot be empty', trigger: 'change' }]
};

const isViewFlag = (data) => {
  return (
    data.status == logisticsProviderStatus.Rejected.toString() ||
    data.status == logisticsProviderStatus.Approved.toString() ||
    data.status == logisticsProviderStatus.NeedRevision.toString()
  );
};

/** Load record for detail/approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getLogisticsProvider(id.value);
    Object.assign(form.value, res.data);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel / Close Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button - 批准 */
const submitForm = () => {
  logisticsProviderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = logisticsProviderStatus.Approved.toString();
      if (form.value.providerId) {
        await updateLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

/** Rejected Button - 从Draft状态变为Rejected状态 */
const rejectStatusForm = () => {
  logisticsProviderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = logisticsProviderStatus.Rejected.toString();
      if (form.value.providerId) {
        await updateLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

/** NeedRevision Button - 从Draft状态变为NeedRevision状态 */
const needRevisionForm = () => {
  logisticsProviderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = logisticsProviderStatus.NeedRevision.toString();
      if (form.value.providerId) {
        await updateLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
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
