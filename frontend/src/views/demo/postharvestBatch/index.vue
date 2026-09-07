<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Batch ID" prop="batchId">
              <el-select
                v-model="queryParams.batchId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="batchIdRemoteMethod"
                :loading="batchIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Crop Type" prop="cropCode">
              <!-- <el-input v-model="queryParams.cropCode" placeholder="Please input Crop Type" clearable @keyup.enter="handleQuery" /> -->
              <!-- <el-select v-model="queryParams.cropCode" placeholder="Please select" clearable>
                <el-option v-for="dict in cropDataList" :key="dict.id" :label="dict.cropName" :value="dict.id"></el-option>
              </el-select> -->
              <el-select
                v-model="queryParams.cropCode"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="cropFilterRemoteMethod"
                :loading="cropFilterLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in cropFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Batch Weight(qt)" prop="batchWeightQt">
              <el-input v-model="queryParams.batchWeightQt" placeholder="请输入批次总重量" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="批次创建日期时间" prop="creationDate">
              <el-date-picker
                clearable
                v-model="queryParams.creationDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择批次创建日期时间"
              />
            </el-form-item> -->
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
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">Delete</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" >导出</el-button>
          </el-col> -->
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button class="import-csv-btn" type="primary" plain icon="Upload" @click="openImportDialog">Import CSV</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="postharvestBatchList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="Batch ID" align="center" prop="batchId" :min-width="getColumnWidth('Batch ID')" />
        <!-- <el-table-column label="关联的收获记录ID列表" align="center" prop="harvestIdsJson" /> -->
        <el-table-column label="Crop Type" align="center" prop="cropName" :min-width="getColumnWidth('Crop Type')" />
        <el-table-column label="Batch Weight (qt)" align="center" prop="batchWeightQt" :min-width="getColumnWidth('Batch Weight (qt)')" />
        <!-- <el-table-column label="Create By" align="center" prop="createdUserName" /> -->
        <!-- <el-table-column label="Creation Date" align="center" prop="creationDate" width="180" :min-width="getColumnWidth('Creation Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.creationDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ PostHarvestBatchStatus[scope.row.status as PostHarvestBatchStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Created Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog title="Import Postharvest Batch CSV" v-model="importDialog.visible" width="900px" append-to-body>
      <el-upload
        drag
        :auto-upload="false"
        :limit="1"
        accept=".csv"
        :file-list="importDialog.fileList"
        :on-change="handleImportChange"
        :on-remove="handleImportRemove"
        :on-exceed="handleImportExceed"
      >
        <div class="el-upload__text">Drop CSV file here or <em>click to upload</em></div>
        <template #tip>
          <div class="el-upload__tip">Only .csv file is supported. Header: cropCode,batchWeightQt,creationDate,harvestId</div>
        </template>
      </el-upload>

      <div v-if="importDialog.validateResult" class="mt-4">
        <el-alert
          type="info"
          :closable="false"
          :title="`Validate done. Total: ${importDialog.validateResult.totalRows}, Valid: ${importDialog.validateResult.validRows}, Invalid: ${importDialog.validateResult.invalidRows}`"
        />
        <el-table
          v-if="importDialog.validateResult.errorRows && importDialog.validateResult.errorRows.length > 0"
          class="mt-2"
          stripe
          border
          height="220"
          :data="importDialog.validateResult.errorRows"
        >
          <el-table-column label="Row No" prop="rowNo" width="100" />
          <el-table-column label="Error Message" prop="errorMessage" />
        </el-table>
      </div>

      <div v-if="importDialog.confirmResult" class="mt-4">
        <el-alert
          type="success"
          :closable="false"
          :title="`Import done. Total: ${importDialog.confirmResult.totalRows}, Success: ${importDialog.confirmResult.successRows}, Failed: ${importDialog.confirmResult.failRows}`"
        />
        <el-table
          v-if="importDialog.confirmResult.failDetails && importDialog.confirmResult.failDetails.length > 0"
          class="mt-2"
          stripe
          border
          height="220"
          :data="importDialog.confirmResult.failDetails"
        >
          <el-table-column label="Row No" prop="rowNo" width="100" />
          <el-table-column label="Error Message" prop="errorMessage" />
        </el-table>
      </div>

      <template #footer>
        <el-button :loading="importDialog.validating" type="primary" icon="Search" @click="handleImportValidate">Validate</el-button>
        <el-button
          :loading="importDialog.confirming"
          type="success"
          icon="Select"
          :disabled="!importDialog.validateResult || importDialog.validateResult.validRows <= 0"
          @click="handleImportConfirm"
        >
          Confirm Import
        </el-button>
        <el-button @click="closeImportDialog">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PostharvestBatch" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { HarvestCollectionVO } from '@/api/demo/harvestCollection/types';
import {
  addPostharvestBatch,
  confirmPostharvestBatchImportCsv,
  delPostharvestBatch,
  getPostharvestBatch,
  listPostharvestBatch,
  validatePostharvestBatchImportCsv,
  updatePostharvestBatch
} from '@/api/demo/postharvestBatch';
import {
  PostharvestBatchForm,
  PostharvestBatchImportConfirmVO,
  PostharvestBatchImportValidateVO,
  PostharvestBatchQuery,
  PostharvestBatchVO
} from '@/api/demo/postharvestBatch/types';
import { PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';
import type { UploadProps, UploadRawFile, UploadUserFile } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const postharvestBatchList = ref<PostharvestBatchVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const postharvestBatchFormRef = ref<ElFormInstance>();

const harvestCollectionList = ref<HarvestCollectionVO[]>([]);
const availableHarvestCollectionList = ref<HarvestCollectionVO[]>([]);
const availableLoading = ref(false);
const availableTotal = ref(0);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const importDialog = reactive<{
  visible: boolean;
  fileList: UploadUserFile[];
  rawFile?: File;
  validating: boolean;
  confirming: boolean;
  validateResult?: PostharvestBatchImportValidateVO;
  confirmResult?: PostharvestBatchImportConfirmVO;
}>({
  visible: false,
  fileList: [],
  rawFile: undefined,
  validating: false,
  confirming: false,
  validateResult: undefined,
  confirmResult: undefined
});
// const dialogUpdate = reactive<DialogOption>({
//   visible: false,
//   title: ''
// });
// const dialogView = reactive<DialogOption>({
//   visible: false,
//   title: ''
// });

const initFormData: PostharvestBatchForm = {
  id: undefined,
  batchId: undefined,
  harvestIdsJson: undefined,
  cropCode: undefined,
  cropName: undefined,
  batchWeightQt: undefined,
  creationDate: undefined,
  status: PostHarvestBatchStatus.Created.toString()
};
const data = reactive<PageData<PostharvestBatchForm, PostharvestBatchQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    batchId: undefined,
    harvestIdsJson: undefined,
    cropCode: undefined,
    batchWeightQt: undefined,
    creationDate: undefined,
    status: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
    // batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    // harvestIdsJson: [{ required: true, message: '关联的收获记录ID列表不能为空 cannot be empty', trigger: 'blur' }],
    cropCode: [{ required: true, message: 'Crop Name cannot be empty', trigger: 'blur' }],
    batchWeightQt: [{ required: true, message: 'Batch Weight cannot be empty', trigger: 'blur' }],
    // creationDate: [{ required: true, message: '批次创建日期时间不能为空 cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const availableQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  harvestId: undefined as string | undefined,
  farmerId: undefined as string | undefined
});
const unifiedHarvestCollectionList = computed(() => {
  const selectedIds = new Set(harvestCollectionList.value.map((item) => item.id));
  return [...harvestCollectionList.value, ...availableHarvestCollectionList.value.filter((item) => !selectedIds.has(item.id))];
});

const batchIdOptions = ref([]);
const batchIdList = ref([]);
const batchIdLoading = ref(false);
const batchIdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdLoading.value = true;
    const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query });
    batchIdList.value = res.rows;
    batchIdOptions.value = res.rows.map((item) => ({
      value: item.batchId,
      label: `${item.batchId}`
    }));
    batchIdLoading.value = false;
  } else {
    batchIdOptions.value = [];
  }
};

const cropFilterOptions = ref([]);
const cropFilterList = ref([]);
const cropFilterLoading = ref(false);
const cropFilterRemoteMethod = async (query: string) => {
  if (!query) {
    cropFilterOptions.value = [];
    cropFilterList.value = [];
    return;
  }
  cropFilterLoading.value = true;
  try {
    const res = await request({
      url: '/demo/postharvestBatch/autoComplete/cropCode',
      method: 'get',
      params: { cropCode: query, cropName: query }
    });
    const codes: string[] = res.data || [];
    cropFilterList.value = codes;
    cropFilterOptions.value = codes.map((code) => ({
      value: code,
      label: resolveCropNameByCode(code)
    }));
  } finally {
    cropFilterLoading.value = false;
  }
};

const cropCodeOptions = ref<Array<{ value: string; label: string }>>([]);
const cropCodeList = ref<Array<{ cropCode: string; cropName?: string }>>([]);
const cropCodeLoading = ref(false);

const mapCropMasterToOptions = (rows: Array<{ cropCode?: string; cropName?: string }>) => {
  const dedup = new Map<string, { cropCode: string; cropName?: string }>();
  (rows || []).forEach((item) => {
    if (item.cropCode) {
      dedup.set(item.cropCode, { cropCode: item.cropCode, cropName: item.cropName });
    }
  });
  return [...dedup.values()].map((item) => ({
    value: item.cropCode,
    label: item.cropName || item.cropCode
  }));
};

const syncCropCodeOptionForForm = (cropCode?: string, cropName?: string) => {
  if (!cropCode) {
    return;
  }
  const label = cropName || resolveCropNameByCode(cropCode);
  if (!cropCodeOptions.value.some((item) => item.value === cropCode)) {
    cropCodeOptions.value = [{ value: cropCode, label }, ...cropCodeOptions.value];
  }
};

const cropCodeRemoteMethod = async (query: string) => {
  if (!query) {
    syncCropCodeOptionForForm(form.value.cropCode, form.value.cropName);
    if (!form.value.cropCode) {
      cropCodeOptions.value = [];
    }
    return;
  }
  cropCodeLoading.value = true;
  try {
    const [byCodeRes, byNameRes] = await Promise.all([
      listCropMaster({ pageNum: 1, pageSize: 20, cropCode: query }),
      listCropMaster({ pageNum: 1, pageSize: 20, cropName: query })
    ]);
    const dedup = new Map<string, { cropCode: string; cropName?: string }>();
    [...(byCodeRes.rows || []), ...(byNameRes.rows || [])].forEach((item) => {
      if (item.cropCode) {
        dedup.set(item.cropCode, item);
      }
    });
    cropCodeList.value = [...dedup.values()];
    cropCodeOptions.value = mapCropMasterToOptions(cropCodeList.value);
    syncCropCodeOptionForForm(form.value.cropCode, form.value.cropName);
  } finally {
    cropCodeLoading.value = false;
  }
};

/** 查询产后批次列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPostharvestBatch(queryParams.value);
  postharvestBatchList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  postharvestBatchFormRef.value?.resetFields();
  harvestCollectionList.value = [];
  availableHarvestCollectionList.value = [];
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const openImportDialog = () => {
  importDialog.visible = true;
  importDialog.fileList = [];
  importDialog.rawFile = undefined;
  importDialog.validateResult = undefined;
  importDialog.confirmResult = undefined;
};

const closeImportDialog = () => {
  importDialog.visible = false;
};

const handleImportExceed = () => {
  proxy?.$modal.msgError('Only one CSV file can be uploaded at a time');
};

const handleImportChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  const rawFile = uploadFile.raw as UploadRawFile | undefined;
  const fileName = rawFile?.name || uploadFile.name || '';
  if (!fileName.toLowerCase().endsWith('.csv')) {
    proxy?.$modal.msgError('Only CSV file is supported');
    importDialog.fileList = [];
    importDialog.rawFile = undefined;
    return;
  }
  importDialog.fileList = uploadFiles.slice(-1);
  importDialog.rawFile = rawFile;
};

const handleImportRemove: UploadProps['onRemove'] = () => {
  importDialog.rawFile = undefined;
};

const handleImportValidate = async () => {
  const rawFile = importDialog.rawFile;
  if (!rawFile) {
    proxy?.$modal.msgError('Please select CSV file first');
    return;
  }
  const formData = new FormData();
  formData.append('file', rawFile);
  importDialog.validating = true;
  try {
    const res = await validatePostharvestBatchImportCsv(formData);
    importDialog.validateResult = res.data;
    importDialog.confirmResult = undefined;
    proxy?.$modal.msgSuccess('Validate success');
  } finally {
    importDialog.validating = false;
  }
};

const handleImportConfirm = async () => {
  const token = importDialog.validateResult?.importToken;
  if (!token) {
    proxy?.$modal.msgError('Please validate CSV first');
    return;
  }
  if ((importDialog.validateResult?.validRows || 0) <= 0) {
    proxy?.$modal.msgError('No valid rows to import');
    return;
  }
  importDialog.confirming = true;
  try {
    const res = await confirmPostharvestBatchImportCsv(token);
    importDialog.confirmResult = res.data;
    if (res.data.failRows > 0) {
      proxy?.$modal.msgWarning(`Import finished with failures. Success: ${res.data.successRows}, Failed: ${res.data.failRows}`);
    } else {
      proxy?.$modal.msgSuccess(`Import success. Total rows: ${res.data.totalRows}`);
    }
    await getList();
  } finally {
    importDialog.confirming = false;
  }
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: PostharvestBatchVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const dialogAction = ref('');

const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'PostharvestBatchAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: PostharvestBatchVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'PostharvestBatchEdit', params: { id: _id } });
};

const handleView = (row?: PostharvestBatchVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'PostharvestBatchDetail', params: { id: _id } });
};

const getExData = async (row) => {
  const res = await request({
    url: `/demo/postharvestBatch/${row.id}/connection`,
    method: 'get'
  });
  harvestCollectionList.value = res.data;
  syncSelectedHarvestData();

  form.value.cropName = row.cropName || cropDataList.value?.find((item) => item.cropCode == row.cropCode)?.cropName;
  syncCropCodeOptionForForm(form.value.cropCode, form.value.cropName);
  await getAvailableHarvestList();
};

const handleCropCodeChange = async (cropCode: string) => {
  const crop = cropCodeList.value?.find((item) => item.cropCode === cropCode) || cropDataList.value?.find((item) => item.cropCode === cropCode);
  form.value.cropName = crop?.cropName;
  syncCropCodeOptionForForm(cropCode, form.value.cropName);
  harvestCollectionList.value = [];
  syncSelectedHarvestData();
  await getAvailableHarvestList();
};

const syncSelectedHarvestData = () => {
  form.value.batchWeightQt = harvestCollectionList.value.reduce((total, item) => total + (item.quantityQt || 0), 0);
  const harvestIds = harvestCollectionList.value.map((item) => item.id);
  form.value.harvestIdsJson = JSON.stringify(harvestIds);
};

const getAvailableHarvestList = async () => {
  if (!form.value.cropCode) {
    availableHarvestCollectionList.value = [];
    availableTotal.value = 0;
    return;
  }
  availableLoading.value = true;
  try {
    const res = await request({
      url: '/demo/harvestCollection/list/unused',
      method: 'get',
      params: {
        pageNum: availableQueryParams.pageNum,
        pageSize: availableQueryParams.pageSize,
        cropCode: form.value.cropCode,
        harvestId: availableQueryParams.harvestId,
        farmerId: availableQueryParams.farmerId
      }
    });
    const selectedIds = new Set(harvestCollectionList.value.map((item) => item.id));
    availableHarvestCollectionList.value = (res.rows || []).filter((item) => !selectedIds.has(item.id));
    availableTotal.value = (res.total || availableHarvestCollectionList.value.length) + harvestCollectionList.value.length;
  } finally {
    availableLoading.value = false;
  }
};

const handleLoadAvailableData = async () => {
  availableQueryParams.pageNum = 1;
  await getAvailableHarvestList();
};

const handleQueryAvailable = () => {
  availableQueryParams.pageNum = 1;
  getAvailableHarvestList();
};

const resetAvailableQuery = () => {
  availableQueryParams.harvestId = undefined;
  availableQueryParams.farmerId = undefined;
  availableQueryParams.pageNum = 1;
  getAvailableHarvestList();
};

const isHarvestSelected = (row: HarvestCollectionVO) => harvestCollectionList.value.some((item) => item.id === row.id);

const allVisibleHarvestSelected = computed(() => {
  const rows = unifiedHarvestCollectionList.value;
  return rows.length > 0 && rows.every((row) => isHarvestSelected(row));
});

const someVisibleHarvestSelected = computed(() => {
  const rows = unifiedHarvestCollectionList.value;
  const selectedCount = rows.filter((row) => isHarvestSelected(row)).length;
  return selectedCount > 0 && selectedCount < rows.length;
});

const updateHarvestSelection = (row: HarvestCollectionVO, checked: boolean) => {
  const selectedById = new Map(harvestCollectionList.value.map((item) => [item.id, item]));
  if (checked) {
    selectedById.set(row.id, row);
  } else {
    selectedById.delete(row.id);
  }
  harvestCollectionList.value = [...selectedById.values()];
  syncSelectedHarvestData();
};

const handleHarvestCheckboxChange = (row: HarvestCollectionVO, checked: boolean | string | number) => {
  updateHarvestSelection(row, Boolean(checked));
};

const toggleAllVisibleHarvest = (checked: boolean | string | number) => {
  const selectedById = new Map(harvestCollectionList.value.map((item) => [item.id, item]));
  unifiedHarvestCollectionList.value.forEach((row) => {
    if (Boolean(checked)) {
      selectedById.set(row.id, row);
    } else {
      selectedById.delete(row.id);
    }
  });
  harvestCollectionList.value = [...selectedById.values()];
  syncSelectedHarvestData();
};

/** 提交按钮 */
const submitForm = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PostHarvestBatchStatus.Created.toString();

      if (form.value.id) {
        await updatePostharvestBatch(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPostharvestBatch(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const submitFormUpdate = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PostHarvestBatchStatus.Created.toString();

      if (form.value.id) {
        await updatePostharvestBatch(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPostharvestBatch(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PostharvestBatchVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delPostharvestBatch(_ids);
  proxy?.$modal.msgSuccess('success');
  await getList();
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 2000 });
  cropDataList.value = res.rows || [];
};

const resolveCropNameByCode = (cropCode?: string) => {
  if (!cropCode) {
    return '—';
  }
  const found = cropDataList.value?.find((item) => item.cropCode === cropCode);
  return found?.cropName || cropCode;
};

const getCropDisplayName = (row?: { cropCode?: string; cropName?: string }) => {
  if (row?.cropName) {
    return row.cropName;
  }
  return resolveCropNameByCode(row?.cropCode);
};

const cropFormatter = (row: { cropCode?: string; cropName?: string }) => {
  return getCropDisplayName(row);
};

const isViewFlag = (data) => {
  return data.status != PostHarvestBatchStatus.Created;
};

onMounted(async () => {
  await getCropList();
  await getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

<style scoped>
.postharvest-batch-crop-type-item {
  width: 400px;
  min-width: 400px;
}

/* Import CSV 按钮：与 R&D "Add By Farmers" 对齐
   （primary plain：透明底、绿字 #009a44、字重 600、悬停/按下绿 8% 浅底 #009a4414、图标绿色） */
.import-csv-btn {
  background-color: transparent !important;
  color: #009a44 !important;
  font-weight: 600;
}
.import-csv-btn:hover,
.import-csv-btn:active {
  background-color: #009a4414 !important;
  color: #009a44 !important;
}
.import-csv-btn .el-icon {
  color: #009a44 !important;
}
</style>
