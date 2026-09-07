<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Quality Inspection ID" prop="qiId">
              <!-- <el-input v-model="queryParams.qiId" placeholder="Please input ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.qiId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="qiIdFilterRemoteMethod"
                :loading="qiIdFilterLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in qiIdFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Batch ID" prop="batchId">
              <!-- <el-input v-model="queryParams.batchId" placeholder="Please input Batch ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.batchId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="batchIdFilterRemoteMethod"
                :loading="batchIdFilterLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in batchIdFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Grade Name" prop="gradeCode">
              <el-select v-model="queryParams.gradeCode" placeholder="Please select" clearable>
                <el-option v-for="dict in gradeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="质检时水分百分比" prop="moisturePct">
              <el-input v-model="queryParams.moisturePct" placeholder="请输入质检时水分百分比" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="杂质含量百分比" prop="impurityLevel">
              <el-input v-model="queryParams.impurityLevel" placeholder="请输入杂质含量百分比" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="质检员用户ID" prop="inspector">
              <el-input v-model="queryParams.inspector" placeholder="请输入质检员用户ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="质检执行日期时间" prop="inspectionDate">
              <el-date-picker clearable
                v-model="queryParams.inspectionDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择质检执行日期时间"
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:qualityInspection:add']">Add</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:qualityInspection:edit']"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:qualityInspection:remove']"
              >Delete</el-button
            >
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:qualityInspection:export']">导出</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="qualityInspectionList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="Quality Inspection ID" align="center" prop="qiId" :min-width="getColumnWidth('Quality Inspection ID')" />
        <el-table-column label="Batch ID" align="center" prop="batchName" :min-width="getColumnWidth('Batch ID')" />
        <el-table-column label="Batch Actual Yield (q)" align="center" prop="batchWeightQt" :min-width="getColumnWidth('Batch Actual Yield (q)')" />
        <el-table-column label="Grade Name" align="center" prop="gradeName" :min-width="getColumnWidth('Grade   Name')" />
        <el-table-column label="Moisture (%)" align="center" prop="moisturePct" :min-width="getColumnWidth('Moisture (%)')" />
        <el-table-column label="Impurity Level (%)" align="center" prop="impurityLevel" :min-width="getColumnWidth('Impurity Level (%)')" />
        <el-table-column label="Inspector" align="center" prop="inspectorUserName" :min-width="getColumnWidth('Inspector')" />
        <!-- <el-table-column label="Inspection Date" align="center" prop="inspectionDate" width="180" :min-width="getColumnWidth('Inspection Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
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
              v-if="scope.row.status != ApprovalStatus.Draft.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button
              v-if="scope.row.status == ApprovalStatus.Draft.toString()"
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

<script setup name="QualityInspection" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listQualityGradeMaster } from '@/api/demo/qualityGradeMaster';
import {
  addQualityInspection,
  delQualityInspection,
  getQualityInspection,
  listQualityInspection,
  updateQualityInspection
} from '@/api/demo/qualityInspection';
import { QualityInspectionForm, QualityInspectionQuery, QualityInspectionVO } from '@/api/demo/qualityInspection/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const qualityInspectionList = ref<QualityInspectionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const qualityInspectionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: QualityInspectionForm = {
  id: undefined,
  qiId: undefined,
  batchId: undefined,
  batchWeightQt: undefined,
  gradeCode: undefined,
  moisturePct: undefined,
  impurityLevel: undefined,
  inspector: undefined,
  inspectionDate: undefined
};
const data = reactive<PageData<QualityInspectionForm, QualityInspectionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    qiId: undefined,
    batchId: undefined,
    gradeCode: undefined,
    moisturePct: undefined,
    impurityLevel: undefined,
    inspector: undefined,
    inspectionDate: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    qiId: [{ required: true, message: 'Quality Inspection ID cannot be empty', trigger: 'blur' }],
    batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    gradeCode: [{ required: true, message: 'Grade cannot be empty', trigger: 'blur' }],
    moisturePct: [{ required: true, message: 'Moisture (%) cannot be empty', trigger: 'blur' }]
    // impurityLevel: [{ required: true, message: 'Impurity Level (%) cannot be empty', trigger: 'blur' }]
    // inspector: [{ required: true, message: 'Inspector cannot be empty', trigger: 'blur' }],
    // inspectionDate: [{ required: true, message: 'Inspection Date cannot be empty', trigger: 'blur' }]
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
      value: item.id,
      label: `${item.batchId}`
    }));
    batchIdLoading.value = false;
  } else {
    batchIdOptions.value = [];
  }
};

const qiIdFilterOptions = ref([]);
const qiIdFilterList = ref([]);
const qiIdFilterLoading = ref(false);
const qiIdFilterRemoteMethod = async (query: string) => {
  if (query) {
    qiIdFilterLoading.value = true;
    const res = await listQualityInspection({ pageNum: 1, pageSize: 10, qiId: query });
    qiIdFilterList.value = res.rows;
    qiIdFilterOptions.value = res.rows.map((item) => ({
      value: item.qiId,
      label: `${item.qiId}`
    }));
    qiIdFilterLoading.value = false;
  } else {
    qiIdFilterOptions.value = [];
  }
};

const batchIdFilterOptions = ref([]);
const batchIdFilterList = ref([]);
const batchIdFilterLoading = ref(false);
const batchIdFilterRemoteMethod = async (query: string) => {
  if (query) {
    batchIdFilterLoading.value = true;
    const res = await request({
      url: '/demo/qualityInspection/autoComplete/batchId',
      method: 'get',
      params: { batchName: query }
    });
    batchIdFilterList.value = res.data;
    batchIdFilterOptions.value = res.data.map((item) => ({
      value: item.id,
      label: `${item.batchId}`
    }));
    batchIdFilterLoading.value = false;
  } else {
    batchIdFilterOptions.value = [];
  }
};

/** 查询质量检验列表 */
const getList = async () => {
  loading.value = true;
  const res = await listQualityInspection(queryParams.value);
  qualityInspectionList.value = res.rows;
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
  qualityInspectionFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: QualityInspectionVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Quality Inspection';
};

/** 修改按钮操作 */
const handleUpdate = (row?: QualityInspectionVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'QualityInspectionApprovalApprove', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  qualityInspectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Approved.toString();

      if (form.value.id) {
        await updateQualityInspection(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addQualityInspection(form.value).finally(() => (buttonLoading.value = false));
      }

      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  qualityInspectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.id) {
        await updateQualityInspection(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addQualityInspection(form.value).finally(() => (buttonLoading.value = false));
      }

      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  qualityInspectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.id) {
        await updateQualityInspection(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addQualityInspection(form.value).finally(() => (buttonLoading.value = false));
      }

      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: QualityInspectionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delQualityInspection(_ids);
  proxy?.$modal.msgSuccess('success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/qualityInspection/export',
    {
      ...queryParams.value
    },
    `qualityInspection_${new Date().getTime()}.xlsx`
  );
};

const handleView = (row?: QualityInspectionVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'QualityInspectionApprovalDetail', params: { id: _id } });
};

const gradeOptions = ref([]);
const getGradeList = async () => {
  const res = await listQualityGradeMaster({ pageNum: 1, pageSize: 10 });
  gradeOptions.value = res.rows.map((item) => ({
    value: item.gradeCode,
    label: `${item.gradeName}`
  }));
};

onMounted(async () => {
  await getGradeList();
  await getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

