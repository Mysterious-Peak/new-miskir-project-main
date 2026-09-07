<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="coldChainReadingFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Cold Chain Reading Id" prop="sensorId" v-show="!isAdd">
          <el-input v-model="form.sensorId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Trip Id" prop="tripId">
          <el-select
            v-model="form.tripId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="tripIdPopRemoteMethod"
            :loading="tripIdPopLoading"
            :debounce="300"
            clearable
          >
            <el-option v-for="item in tripIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Temperature" prop="temperature">
          <el-input-number v-model="form.temperature" placeholder="Please input" :precision="2" style="width: 200px" />
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

<script setup name="ColdChainReadingForm" lang="ts">
import { addColdChainReading, getColdChainReading, updateColdChainReading } from '@/api/demo/coldChainReading';
import { ColdChainReadingForm } from '@/api/demo/coldChainReading/types';
import { listTrip } from '@/api/demo/trip';
import { TripVO } from '@/api/demo/trip/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const coldChainReadingFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: ColdChainReadingForm = {
  sensorId: undefined,
  tripId: undefined,
  temperature: undefined
};

const form = ref<ColdChainReadingForm>({ ...initFormData });

const rules = {
  tripId: [{ required: true, message: 'Trip Id cannot be empty', trigger: 'blur' }]
};

const tripList = ref<TripVO[]>([]);
const tripIdPopOptions = ref([]);
const tripIdPopLoading = ref(false);
const tripIdPopRemoteMethod = async (query: string) => {
  if (query) {
    tripIdPopLoading.value = true;
    const list = tripList.value.filter((f) => f.tripId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.tripId);
    tripIdPopOptions.value = list.map((item) => ({
      value: item,
      label: item
    }));
    tripIdPopLoading.value = false;
  } else {
    tripIdPopOptions.value = [];
  }
};

/** Load record for edit mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getColdChainReading(id.value);
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
  coldChainReadingFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (form.value.sensorId) {
        await updateColdChainReading(form.value);
      } else {
        await addColdChainReading(form.value);
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
  listTrip().then((res) => {
    tripList.value = res.rows;
  });
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
