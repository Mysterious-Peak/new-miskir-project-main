<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
            <el-form-item label="Shipment ID" prop="shipmentId">
              <el-select
                v-model="queryParams.shipmentId"
                filterable
                remote
                reserve-keyword
                clearable
                placeholder="Please input"
                :remote-method="queryShipmentIdRemoteMethod"
                :loading="queryShipmentIdLoading"
                :debounce="300"
              >
                <el-option v-for="item in queryShipmentIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Name of receiver" prop="receivedBy">
              <el-input prefix-icon="Search" v-model="queryParams.receivedBy" placeholder="Please enter Name of receiver" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:proofOfDelivery:export']">Export</el-button>
          </el-col> --> 
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:proofOfDelivery:remove']"
              >Delete</el-button
            >
          </el-col> -->
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:proofOfDelivery:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="proofOfDeliveryList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Pod ID" align="center" prop="podId" v-if="true" :min-width="getColumnWidth('Proof Of Delivery ID')" />
        <el-table-column label="Shipment ID" align="center" prop="shipmentId" :min-width="getColumnWidth('Shipment ID')" />
        <el-table-column label="Name of receiver" align="center" prop="receivedBy" :min-width="getColumnWidth('Name of receiver')" />
        <el-table-column label="Receipt timestamp" align="center" prop="receivedAt" :min-width="getColumnWidth('Receipt timestamp')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.receivedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Digital signature blob" align="center" prop="signature" :min-width="getColumnWidth('Digital signature blob')">
          <template #default="scope">
            <image-preview :src="scope.row.signatureUrl" :width="150" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="Delivery photos" align="center" prop="photos" :min-width="getColumnWidth('Delivery photos')">
          <template #default="scope">
            <image-preview :src="scope.row.photosUrl" :width="150" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              v-hasPermi="['demo:proofOfDelivery:edit']"
              >View</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:proofOfDelivery:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add, Edit or View Proof of Delivery Dialog -->
  </div>
</template>

<script setup name="ProofOfDelivery" lang="ts">
import {
  listProofOfDelivery,
  autoCompleteProofOfDeliveryShipmentId,
  autoCompleteProofOfDeliveryExistingShipmentId,
  getProofOfDelivery,
  delProofOfDelivery,
  addProofOfDelivery,
  updateProofOfDelivery
} from '@/api/demo/proofOfDelivery';
import { ProofOfDeliveryVO, ProofOfDeliveryQuery, ProofOfDeliveryForm } from '@/api/demo/proofOfDelivery/types';
import { getColumnWidth } from '@/utils/utils';
import { listByIds } from '@/api/system/oss';
import { ShipmentOrderStatus, shipmentPlanningStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const proofOfDeliveryList = ref<ProofOfDeliveryVO[]>([]);
const buttonLoading = ref(false);
const isViewMode = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const proofOfDeliveryFormRef = ref<ElFormInstance>();

// 查询区 Shipment ID：仅已有 POD（/autoComplete/shipmentId/existing）
const queryShipmentIdLoading = ref(false);
const queryShipmentIdOptions = ref<{ label: string; value: string | number }[]>([]);
const queryShipmentIdList = ref<any[]>([]);

const queryShipmentIdRemoteMethod = async (query: string) => {
  if (query) {
    queryShipmentIdLoading.value = true;
    try {
      const res = await autoCompleteProofOfDeliveryExistingShipmentId({
        shipmentId: query?.trim(),
        pageNum: null,
        pageSize: null
      } as any);
      queryShipmentIdList.value = (res as any).data || (res as any).rows || [];
      queryShipmentIdOptions.value = queryShipmentIdList.value.map((item: any) => ({
        value: item.shipmentId,
        label: String(item.shipmentId)
      }));
    } finally {
      queryShipmentIdLoading.value = false;
    }
  } else {
    queryShipmentIdOptions.value = [];
  }
};

// 弹窗 Shipment ID：全量运单补全
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

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProofOfDeliveryForm = {
  podId: undefined,
  shipmentId: undefined,
  receivedBy: undefined,
  receivedAt: undefined,
  signature: undefined,
  photos: undefined
};
const data = reactive<PageData<ProofOfDeliveryForm, ProofOfDeliveryQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    shipmentId: undefined,
    receivedBy: undefined,
    receivedAt: undefined,
    signature: undefined,
    photos: undefined,
    params: {}
  },
  rules: {
    podId: [{ required: true, message: 'Unique POD identifier cannot be empty', trigger: 'blur' }],
    shipmentId: [{ required: true, message: 'Shipment ID cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Convert OSS ID string to URL string */
// const convertOssIdToUrl = async (ossIdStr: string | undefined): Promise<string> => {
//   if (!ossIdStr) return '';
//   // 如果已经是 URL（以 http:// 或 https:// 开头），直接返回
//   if (typeof ossIdStr === 'string' && (ossIdStr.startsWith('http://') || ossIdStr.startsWith('https://'))) {
//     return ossIdStr;
//   }
//   try {
//     const res = await listByIds(ossIdStr);
//     if (res.data && Array.isArray(res.data)) {
//       return res.data.map((item: any) => item.url).join(',');
//     }
//     return '';
//   } catch (error) {
//     console.error('Failed to convert OSS ID to URL:', error);
//     return '';
//   }
// };

/** Query Proof of Delivery List */
const getList = async () => {
  loading.value = true;
  const res = await listProofOfDelivery(queryParams.value);
  proofOfDeliveryList.value = res.rows;
  // Convert OSS IDs to URLs for image preview
  // const rows = await Promise.all(
  //   res.rows.map(async (row: any) => {
  //     const signatureUrl = await convertOssIdToUrl(row.signature);
  //     const photosUrl = await convertOssIdToUrl(row.photos);
  //     return {
  //       ...row,
  //       signature: signatureUrl,
  //       photos: photosUrl
  //     };
  //   })
  // );
  // proofOfDeliveryList.value = rows;
  total.value = res.total;
  loading.value = false;
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  proofOfDeliveryFormRef.value?.resetFields();
};

/** Search Button Action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset Button Action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** Multi-select Selected Data */
const handleSelectionChange = (selection: ProofOfDeliveryVO[]) => {
  ids.value = selection.map((item) => item.podId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'ProofOfDeliveryAdd' });
};

/** Edit Button Action */
const handleUpdate = async (row?: ProofOfDeliveryVO) => {
  reset();
  isViewMode.value = false;
  const _podId = row?.podId || ids.value[0];
  const res = await getProofOfDelivery(_podId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Proof of Delivery';
};

/** View Button Action */
const handleView = (row: ProofOfDeliveryVO) => {
  const _podId = row.podId;
  router.push({ name: 'ProofOfDeliveryDetail', params: { id: _podId } });
};

/** Submit Button */
const submitForm = () => {
  proofOfDeliveryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ShipmentOrderStatus.Delivered.toString();
      if (form.value.podId) {
        await updateProofOfDelivery(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addProofOfDelivery(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: ProofOfDeliveryVO) => {
  const _podIds = row?.podId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure you want to delete the proof of delivery with ID "' + _podIds + '"?')
    .finally(() => (loading.value = false));
  await delProofOfDelivery(_podIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/proofOfDelivery/export',
    {
      ...queryParams.value
    },
    `proofOfDelivery_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

