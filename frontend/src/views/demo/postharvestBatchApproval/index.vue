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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">Delete</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" >导出</el-button>
          </el-col> -->
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
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="scope.row.status != PostHarvestBatchStatus.Created.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button
              v-if="scope.row.status == PostHarvestBatchStatus.Created.toString()"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="PostharvestBatch" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { HarvestCollectionVO } from '@/api/demo/harvestCollection/types';
import {
  addPostharvestBatch,
  delPostharvestBatch,
  getPostharvestBatch,
  listPostharvestBatch,
  updatePostharvestBatch
} from '@/api/demo/postharvestBatch';
import { PostharvestBatchForm, PostharvestBatchQuery, PostharvestBatchVO } from '@/api/demo/postharvestBatch/types';
import { PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

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

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

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
    batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    // harvestIdsJson: [{ required: true, message: '关联的收获记录ID列表不能为空 cannot be empty', trigger: 'blur' }],
    cropCode: [{ required: true, message: 'Crop Type cannot be empty', trigger: 'blur' }],
    batchWeightQt: [{ required: true, message: 'Batch Weight cannot be empty', trigger: 'blur' }],
    // creationDate: [{ required: true, message: '批次创建日期时间不能为空 cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

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

// const cropCodeOptions = ref([]);
// const cropCodeList = ref([]);
// const cropCodeLoading = ref(false);
// const cropCodeRemoteMethod = async (query: string) => {
//   if (query) {
//     cropCodeLoading.value = true;
//     const res = await listCropMaster({ pageNum: 1, pageSize: 10, cropCode: query });
//     cropCodeList.value = res.rows;
//     cropCodeOptions.value = res.rows.map((item) => ({
//       value: item.cropCode,
//       label: `${item.cropCode}`
//     }));
//     cropCodeLoading.value = false;
//   } else {
//     cropCodeOptions.value = [];
//   }
// };

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

/** 多选框选中数据 */
const handleSelectionChange = (selection: PostharvestBatchVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Post Harvest Batch';
};

/** 修改按钮操作 */
const handleUpdate = (row?: PostharvestBatchVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'PostharvestBatchApprovalApprove', params: { id: _id } });
};

const handleView = (row?: PostharvestBatchVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'PostharvestBatchApprovalDetail', params: { id: _id } });
};

const getExData = async (row) => {
  const res = await request({
    url: `/demo/postharvestBatch/${row.id}/connection`,
    method: 'get'
  });
  harvestCollectionList.value = res.data;
  form.value.batchWeightQt = res.data.reduce((total, item) => total + (item.quantityQt || 0), 0);

  form.value.cropName = row.cropName || cropDataList.value?.find((item) => item.cropCode == row.cropCode)?.cropName;
};

/** 提交按钮 */
const submitForm = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PostHarvestBatchStatus.Approved.toString();

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

const rejectForm = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PostHarvestBatchStatus.Rejected.toString();

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

const RevisionForm = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PostHarvestBatchStatus.NeedRevision.toString();

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

