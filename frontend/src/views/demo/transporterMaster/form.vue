<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Transporter Master Dialog -->
      <el-form ref="transporterMasterFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="300px">
        <el-form-item label="Transporter Code" prop="transporterId">
          <el-input v-model="form.transporterId" placeholder="Please enter Transporter Code" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" maxlength="100" show-word-limit placeholder="Please enter Transporter/Owner Name" />
        </el-form-item>
        <el-form-item label="Vehicle Plate" prop="vehiclePlate">
          <el-input v-model="form.vehiclePlate" maxlength="20" show-word-limit placeholder="Please enter Vehicle Plate Number" />
        </el-form-item>
        <el-form-item label="Vehicle Capacity (MT)" prop="capacityMt">
          <el-input-number
            v-model="form.capacityMt"
            placeholder="Please enter Vehicle Capacity (MT)"
            style="width: 100%"
            :min="0"
            :max="9999999999.99"
          />
        </el-form-item>
        <el-form-item label="GPS Tracking Enabled (0=No, 1=Yes)" prop="gpsEnabled">
          <el-radio-group v-model="form.gpsEnabled">
            <el-radio :label="0">0</el-radio>
            <el-radio :label="1">1</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" maxlength="20" show-word-limit placeholder="Please enter Contact Phone" />
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

<script setup name="TransporterMasterForm" lang="ts">
import { getTransporterMaster, addTransporterMaster, updateTransporterMaster } from '@/api/demo/transporterMaster';
import { TransporterMasterForm } from '@/api/demo/transporterMaster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const transporterMasterFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: TransporterMasterForm = {
  id: undefined,
  transporterId: undefined,
  name: undefined,
  vehiclePlate: undefined,
  capacityMt: undefined,
  gpsEnabled: 0,
  phone: undefined
};

const form = ref<TransporterMasterForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'Primary Key ID cannot be empty', trigger: 'blur' }],
  transporterId: [{ required: true, message: 'Transporter Code cannot be empty', trigger: 'blur' }],
  name: [{ required: true, message: 'Transporter/Owner Name cannot be empty', trigger: 'blur' }],
  vehiclePlate: [{ required: true, message: 'Vehicle Plate Number cannot be empty', trigger: 'blur' }],
  capacityMt: [{ required: true, message: 'Vehicle Capacity (MT) cannot be empty', trigger: 'blur' }],
  gpsEnabled: [{ required: true, message: 'GPS Tracking Enabled (0=No, 1=Yes) cannot be empty', trigger: 'blur' }],
  phone: [{ required: true, message: 'Contact Phone cannot be empty', trigger: 'blur' }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getTransporterMaster(id.value);
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
  transporterMasterFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateTransporterMaster(form.value);
      } else {
        await addTransporterMaster(form.value);
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
