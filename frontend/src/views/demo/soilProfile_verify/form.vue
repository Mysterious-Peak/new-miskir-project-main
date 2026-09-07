<template>
  <div v-loading="pageLoading" class="p-2">
    <el-form ref="soilProfileFormRef" :model="form" label-position="right">
      <SoilProfileFormBody
        :key="formKey"
        :form="form"
        disabled
        :show-farmland-select="false"
        :show-audit-fields="isView"
      />
      <el-card v-if="isApprove" shadow="hover" class="approval-card">
        <div class="approval-card__title">
          <span>Approval Comment</span>
        </div>
        <el-form-item prop="approvedComment">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-card>
      <div class="form-footer">
        <template v-if="isApprove">
          <el-button :loading="buttonLoading" type="primary" @click="submitApproval">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectApproval">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="revisionApproval">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </template>
        <template v-else>
          <el-button @click="cancel">Close</el-button>
        </template>
      </div>
    </el-form>
  </div>
</template>

<script setup name="SoilProfileVerifyForm" lang="ts">
import { getSoilProfile, updateSoilProfile } from '@/api/demo/soilProfile';
import { SoilProfileForm } from '@/api/demo/soilProfile/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { initSoilProfileForm, parseSoilProfileFormData } from '@/views/demo/soilProfile/constants';
import SoilProfileFormBody from '@/views/demo/soilProfile/SoilProfileFormBody.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const formKey = ref(0);
const soilProfileFormRef = ref<ElFormInstance>();
const form = ref<SoilProfileForm>(initSoilProfileForm());

const isView = computed(() => route.query.mode === 'view');
const isApprove = computed(() => route.query.mode === 'approve');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/form$/, ''));

const loadProfile = async () => {
  const soilProfileId = Array.isArray(route.query.soilProfileId) ? route.query.soilProfileId[0] : route.query.soilProfileId;
  form.value = initSoilProfileForm();
  if (!soilProfileId) {
    formKey.value += 1;
    return;
  }

  pageLoading.value = true;
  try {
    const res = await getSoilProfile(soilProfileId);
    form.value = parseSoilProfileFormData(res.data);
    formKey.value += 1;
  } finally {
    pageLoading.value = false;
  }
};

const cancel = () => {
  router.push(listPath.value);
};

const saveApproval = async (status: ApprovalStatus) => {
  buttonLoading.value = true;
  try {
    form.value.status = status.toString();
    await updateSoilProfile(form.value);
    proxy?.$modal.msgSuccess('success');
    router.push({
      path: listPath.value,
      query: { refresh: '1' }
    });
  } finally {
    buttonLoading.value = false;
  }
};

const submitApproval = () => saveApproval(ApprovalStatus.Approved);
const rejectApproval = () => saveApproval(ApprovalStatus.Rejected);
const revisionApproval = () => saveApproval(ApprovalStatus.NeedRevision);

watch(
  () => [route.query.soilProfileId, route.query.mode] as const,
  () => {
    loadProfile();
  },
  { immediate: true }
);

onActivated(() => {
  loadProfile();
});
</script>

<style scoped>
.approval-card {
  margin-top: 16px;
}

.approval-card__title {
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.form-footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 0;
}
</style>
