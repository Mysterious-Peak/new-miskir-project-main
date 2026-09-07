<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="driverFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Driver Id" prop="driverId" v-show="!isAdd">
          <el-input v-model="form.driverId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Provider Id" prop="providerId">
          <el-select
            v-model="form.providerId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="providerIdPopRemoteMethod"
            :loading="providerIdPopLoading"
            :debounce="300"
            v-if="!isDetail"
            clearable
          >
            <el-option v-for="item in providerIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.providerId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Driver license number" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" placeholder="Please input" :disabled="isDetail" clearable />
        </el-form-item>
        <el-form-item label="Contact phone number" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="Please input" :disabled="isDetail" clearable />
        </el-form-item>

        <el-form-item label="Created By" prop="createdUserName" v-if="isDetail">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Creation Date" prop="createTime" v-if="isDetail">
          <el-date-picker clearable v-model="form.createTime" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName" v-if="isDetail">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt" v-if="isDetail">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isDetail">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
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

<script setup name="DriverForm" lang="ts">
import { addDriver, getDriver, updateDriver } from '@/api/demo/driver';
import { DriverForm } from '@/api/demo/driver/types';
import { listLogisticsProvider } from '@/api/demo/logisticsProvider';
import { LogisticsProviderVO } from '@/api/demo/logisticsProvider/types';
import { DriverInfoStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const driverFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: DriverForm = {
  driverId: undefined,
  providerId: undefined,
  licenseNumber: undefined,
  phoneNumber: undefined,
  status: DriverInfoStatus.Draft.toString()
};

const form = ref<DriverForm>({ ...initFormData });

const rules = {
  providerId: [{ required: true, message: 'Provider Id cannot be empty', trigger: 'blur' }],
  licenseNumber: [{ required: true, message: 'Driver license number cannot be empty', trigger: 'blur' }]
};

const logisticsProviderList = ref<LogisticsProviderVO[]>([]);
const providerIdPopOptions = ref([]);
const providerIdPopLoading = ref(false);
const providerIdPopRemoteMethod = async (query: string) => {
  if (query) {
    providerIdPopLoading.value = true;
    const list = logisticsProviderList.value
      .filter((f) => f.providerId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.providerId);
    providerIdPopOptions.value = list.map((item) => ({
      value: item,
      label: item
    }));
    providerIdPopLoading.value = false;
  } else {
    providerIdPopOptions.value = [];
  }
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
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

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
const submitForm = () => {
  driverFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = DriverInfoStatus.Draft.toString();
      if (form.value.driverId) {
        await updateDriver(form.value);
      } else {
        await addDriver(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(() => {
  loadRecord();
  if (!isDetail.value) {
    listLogisticsProvider().then((res) => {
      logisticsProviderList.value = res.rows;
    });
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
