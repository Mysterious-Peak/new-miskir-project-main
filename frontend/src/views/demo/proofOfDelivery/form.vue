<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="proofOfDeliveryFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="180px">
        <el-form-item label="Pod ID" prop="podId" v-if="form.podId">
          <el-input v-model="form.podId" placeholder="Please enter Pod ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Shipment ID" prop="shipmentId">
          <el-select
            :disabled="isDetail"
            v-model="form.shipmentId"
            filterable
            remote
            reserve-keyword
            clearable
            placeholder="Please input"
            :remote-method="shipmentIdRemoteMethod"
            :loading="shipmentIdLoading"
            :debounce="300"
          >
            <el-option v-for="item in shipmentIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Name of receiver" prop="receivedBy">
          <el-input v-model="form.receivedBy" placeholder="Please enter Name of receiver" :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="Receipt timestamp" prop="receivedAt">
          <el-date-picker
            clearable
            v-model="form.receivedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Receipt timestamp"
            :disabled="isDetail"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Digital signature blob" prop="signature">
          <image-upload v-model="form.signature" :disabled="isDetail" />
        </el-form-item>
        <el-form-item label="Delivery photos" prop="photos">
          <image-upload v-model="form.photos" :disabled="isDetail" />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ProofOfDeliveryForm" lang="ts">
import {
  autoCompleteProofOfDeliveryShipmentId,
  getProofOfDelivery,
  addProofOfDelivery,
  updateProofOfDelivery
} from '@/api/demo/proofOfDelivery';
import { ProofOfDeliveryForm } from '@/api/demo/proofOfDelivery/types';
import { ShipmentOrderStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const proofOfDeliveryFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: ProofOfDeliveryForm = {
  podId: undefined,
  shipmentId: undefined,
  receivedBy: undefined,
  receivedAt: undefined,
  signature: undefined,
  photos: undefined
};

const form = ref<ProofOfDeliveryForm>({ ...initFormData });

const rules = {
  podId: [{ required: true, message: 'Unique POD identifier cannot be empty', trigger: 'blur' }],
  shipmentId: [{ required: true, message: 'Shipment ID cannot be empty', trigger: 'blur' }]
};

const shipmentIdLoading = ref(false);
const shipmentIdOptions = ref<{ label: string; value: string | number }[]>([]);
const shipmentIdList = ref<any[]>([]);

const shipmentIdRemoteMethod = async (query: string) => {
  if (query) {
    shipmentIdLoading.value = true;
    try {
      const res = await autoCompleteProofOfDeliveryShipmentId({
        shipmentId: query?.trim(),
        pageNum: null,
        pageSize: null
      } as any);
      shipmentIdList.value = (res as any).data || (res as any).rows || [];
      shipmentIdOptions.value = shipmentIdList.value.map((item: any) => ({
        value: item.shipmentId,
        label: String(item.shipmentId)
      }));
    } finally {
      shipmentIdLoading.value = false;
    }
  } else {
    shipmentIdOptions.value = [];
  }
};

/** Load record for detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getProofOfDelivery(id.value);
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
  proofOfDeliveryFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ShipmentOrderStatus.Delivered.toString();
      if (form.value.podId) {
        await updateProofOfDelivery(form.value);
      } else {
        await addProofOfDelivery(form.value);
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
