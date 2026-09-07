<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="logisticsProviderFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="200px">
        <el-form-item label="Provider ID" prop="providerId" v-if="form.providerId">
          <el-input v-model="form.providerId" placeholder="Please enter Provider ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Provider business name" prop="providerName">
          <el-input v-model="form.providerName" placeholder="Please enter Provider business name" :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="Transport license number" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" placeholder="Please enter Transport license number" :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="Number of vehicles in fleet" prop="fleetSize">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="1000"
            v-model="form.fleetSize"
            placeholder="Please enter Number of vehicles in fleet"
            :disabled="isDetail"
          />
        </el-form-item>
        <el-form-item label="Operating region" prop="region">
          <el-select v-model="form.region" placeholder="Please select Operating region" :disabled="isDetail" clearable>
            <el-option v-for="dict in region" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
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

<script setup name="LogisticsProviderForm" lang="ts">
import { getLogisticsProvider, addLogisticsProvider, updateLogisticsProvider } from '@/api/demo/logisticsProvider';
import { LogisticsProviderForm } from '@/api/demo/logisticsProvider/types';
import { logisticsProviderStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const logisticsProviderFormRef = ref<ElFormInstance>();

const { region } = toRefs<any>(proxy?.useDict('region'));

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: LogisticsProviderForm = {
  providerId: undefined,
  providerName: undefined,
  licenseNumber: undefined,
  fleetSize: undefined,
  region: undefined,
  status: undefined,
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

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
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

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
const submitForm = () => {
  logisticsProviderFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = logisticsProviderStatus.Draft.toString();
      if (form.value.providerId) {
        await updateLogisticsProvider(form.value);
      } else {
        await addLogisticsProvider(form.value);
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
