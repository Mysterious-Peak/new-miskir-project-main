<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="vehicleFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Vehicle Id" prop="vehicleId" v-show="!isAdd">
          <el-input v-model="form.vehicleId" placeholder="Please input" disabled />
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
        <el-form-item label="Vehicle Registration Plate" prop="plateNumber">
          <el-input v-model="form.plateNumber" placeholder="Please input" :disabled="isDetail" clearable />
        </el-form-item>
        <el-form-item label="Vehicle Type" prop="vehicleType">
          <el-select v-model="form.vehicleType" placeholder="Please select" :disabled="isDetail">
            <el-option v-for="dict in vehicle_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Cold Chain Capability" prop="coldChainCapable">
          <el-select v-model="form.coldChainCapable" placeholder="Please select" :disabled="isDetail">
            <el-option v-for="dict in cold_chain_capable" :key="dict.value" :label="dict.label" :value="Number(dict.value)"></el-option>
          </el-select>
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

<script setup name="VehicleForm" lang="ts">
import { getVehicle, addVehicle, updateVehicle } from '@/api/demo/vehicle';
import { VehicleForm } from '@/api/demo/vehicle/types';
import { listLogisticsProvider } from '@/api/demo/logisticsProvider';
import { LogisticsProviderVO } from '@/api/demo/logisticsProvider/types';
import { VehicleInfoStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const vehicleFormRef = ref<ElFormInstance>();

const { vehicle_type, cold_chain_capable } = toRefs<any>(proxy?.useDict('vehicle_type', 'cold_chain_capable'));

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: VehicleForm = {
  vehicleId: undefined,
  providerId: undefined,
  plateNumber: undefined,
  vehicleType: undefined,
  coldChainCapable: undefined,
  status: VehicleInfoStatus.Draft.toString()
};

const form = ref<VehicleForm>({ ...initFormData });

const rules = {
  providerId: [{ required: true, message: 'Provider Id cannot be empty', trigger: 'blur' }],
  plateNumber: [{ required: true, message: 'Vehicle Registration Plate cannot be empty', trigger: 'blur' }],
  vehicleType: [{ required: true, message: 'Vehicle Type cannot be empty', trigger: 'change' }],
  coldChainCapable: [{ required: true, message: 'Cold Chain Capability cannot be empty', trigger: 'blur' }]
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
    const res = await getVehicle(id.value);
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
  vehicleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = VehicleInfoStatus.Draft.toString();
      if (form.value.vehicleId) {
        await updateVehicle(form.value);
      } else {
        await addVehicle(form.value);
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
