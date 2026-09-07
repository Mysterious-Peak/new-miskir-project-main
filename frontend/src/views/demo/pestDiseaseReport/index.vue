<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <!-- <el-input v-model="queryParams.prodSeasonId" placeholder="Please input Production Season ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethodFilter"
                :loading="productionSeasonLoadingFilter"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productionSeasonOptionsFilter" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Report Date" prop="reportDate">
              <el-date-picker clearable v-model="queryParams.reportDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" />
            </el-form-item> -->
            <!-- <el-form-item label="严重程度评分 (1-5)" prop="severityScore">
              <el-input v-model="queryParams.severityScore" placeholder="请输入严重程度评分 (1-5)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="图像链接" prop="imageUrl">
              <el-input v-model="queryParams.imageUrl" placeholder="请输入图像链接" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="AI诊断结果" prop="aiDiagnosis">
              <el-input v-model="queryParams.aiDiagnosis" placeholder="请输入AI诊断结果" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="推荐的行动/治疗措施" prop="recommendedAction">
              <el-input v-model="queryParams.recommendedAction" placeholder="请输入推荐的行动/治疗措施" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="记录人ID" prop="recordedBy">
              <el-input v-model="queryParams.recordedBy" placeholder="请输入记录人ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="核实人ID" prop="verifiedBy">
              <el-input v-model="queryParams.verifiedBy" placeholder="请输入核实人ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="部门ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="请输入部门ID" clearable @keyup.enter="handleQuery" />
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
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="pestDiseaseReportList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Pest Disease ID" align="center" prop="pestId" v-if="true" :min-width="getColumnWidth('Pest Disease ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Report Date" align="center" prop="reportDate" width="180" :min-width="getColumnWidth('Report Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.reportDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Report Time" align="center" prop="reportTime" :min-width="getColumnWidth('Report Time')" />
        <el-table-column label="Category" align="center" prop="category" :min-width="getColumnWidth('Category')">
          <template #default="scope">
            <dict-tag :options="pestDiseaseReportCategoryOptions" :value="scope.row.category" />
          </template>
        </el-table-column>
        <el-table-column label="Type" align="center" prop="pestType" :min-width="getColumnWidth('Type')">
          <template #default="scope">
            <dict-tag :options="pest_type" :value="scope.row.pestType" />
          </template>
        </el-table-column>
        <el-table-column label="Severity Score (1-5)" align="center" prop="severityScore" :min-width="getColumnWidth('Severity Score (1-5)')">
          <template #default="scope">
            <dict-tag :options="pest_severity_score" :value="scope.row.severityScore" />
          </template>
        </el-table-column>
        <el-table-column label="Image Url" align="center" prop="imageUrlUrl" width="150" :min-width="getColumnWidth('Image Url')">
          <template #default="scope">
            <image-preview :src="scope.row.imageUrlUrl" :width="150" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="Auto Diagnosis" align="center" prop="detectResultImgUrl" width="150" :min-width="getColumnWidth('Auto Diagnosis')">
          <template #default="scope">
            <image-preview :src="scope.row.detectResultImgUrl" :width="150" :height="50" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="Auto Diagnosis" align="center" prop="aiDiagnosis" :min-width="getColumnWidth('Auto Diagnosis')" /> -->
        <el-table-column label="Recommended Action" align="center" prop="recommendedAction" :min-width="getColumnWidth('Recommended Action')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ PestDiseaseStatus[scope.row.status as PestDiseaseStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
        <!-- <el-table-column label="Create By" align="center" prop="createBy" /> -->
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="verifiedUserName" :min-width="getColumnWidth('Approved By')" />
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
            <template v-if="!isViewFlag(scope.row)">
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改病虫害报告对话框 -->
  </div>
</template>

<script setup name="PestDiseaseReport" lang="ts">
import {
  listPestDiseaseReport,
  getPestDiseaseReport,
  delPestDiseaseReport,
  addPestDiseaseReport,
  updatePestDiseaseReport
} from '@/api/demo/pestDiseaseReport';
import { PestDiseaseReportVO, PestDiseaseReportQuery, PestDiseaseReportForm, applyPestDiseaseReportToForm } from '@/api/demo/pestDiseaseReport/types';
import { usePestDiseaseReportCategoryForm } from '@/views/demo/pestDiseaseReport/usePestDiseaseReportCategoryForm';
import { resolvePestDiseaseReportCategoryOptions } from '@/views/demo/pestDiseaseReport/constants';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { CroppingSeasonStatus, PestDiseaseStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { pest_type, pest_severity_score, pest_report_date, pest_disease_report_category } = toRefs<any>(
  proxy?.useDict('pest_type', 'pest_severity_score', 'pest_report_date', 'pest_disease_report_category')
);

const pestDiseaseReportList = ref<PestDiseaseReportVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const aiDetectEnabled = ref(false);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const pestDiseaseReportFormRef = ref<ElFormInstance>();

// const statusOptions = [
//   { value: PestDiseaseStatus.Reported.toString(), label: 'Reported' },
//   { value: PestDiseaseStatus.Approved.toString(), label: 'Approved' },
//   { value: PestDiseaseStatus.Actioned.toString(), label: 'Actioned' },
//   { value: PestDiseaseStatus.Closed.toString(), label: 'Closed' }
// ];

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PestDiseaseReportForm = {
  pestId: undefined,
  prodSeasonId: undefined,
  reportDate: undefined,
  reportTime: undefined,
  pestType: undefined,
  category: undefined,
  severityScore: undefined,
  imageUrl: undefined,
  detectResultImgUrl: undefined,
  aiDiagnosis: undefined,
  recommendedAction: undefined,
  status: PestDiseaseStatus.Reported.toString(),
  recordedBy: undefined,
  recordedUserName: undefined,
  verifiedBy: undefined,
  verifiedUserName: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined,
  aiDetected: undefined
};
const data = reactive<PageData<PestDiseaseReportForm, PestDiseaseReportQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    reportDate: undefined,
    reportTime: undefined,
    pestType: undefined,
    severityScore: undefined,
    imageUrl: undefined,
    aiDiagnosis: undefined,
    recommendedAction: undefined,
    status: undefined,
    recordedBy: undefined,
    verifiedBy: undefined,
    deptId: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    // pestId: [{ required: true, message: '病虫害ID不能为空', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
    reportDate: [{ required: true, message: 'Report Date can not be null', trigger: 'blur' }],
    reportTime: [{ required: true, message: 'Report Time can not be null', trigger: 'change' }],
    category: [{ required: true, message: 'Category can not be null', trigger: 'change' }],
    pestType: [{ required: true, message: 'Type can not be null', trigger: 'change' }],
    severityScore: [{ required: true, message: 'Severity Score can not be null', trigger: 'blur' }],
    status: [{ required: true, message: 'Status can not be null', trigger: 'change' }],
    recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const pestDiseaseReportCategoryOptions = computed(() =>
  resolvePestDiseaseReportCategoryOptions(pest_disease_report_category.value)
);

const {
  showTypeField,
  showCategoryDetailFields,
  categoryTypeOptions,
  handleReportCategoryChange,
  syncCategoryFormRules,
  preparePestTypeOnSubmit
} = usePestDiseaseReportCategoryForm({
  form,
  rules,
  pestDiseaseReportFormRef,
  pestDiseaseReportCategory: pestDiseaseReportCategoryOptions,
  pestTypeDict: pest_type
});

const productionSeasonAllList = ref<PestDiseaseReportVO[]>([]);
const productionSeasonOptionsFilter = ref([]);
const productionSeasonListFilter = ref([]);
const productionSeasonLoadingFilter = ref(false);
const productionSeasonRemoteMethodFilter = async (query: string) => {
  if (query) {
    productionSeasonListFilter.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.prodSeasonId?.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.prodSeasonId)
      )
    ];
    productionSeasonLoadingFilter.value = true;
    productionSeasonOptionsFilter.value = productionSeasonListFilter.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    productionSeasonLoadingFilter.value = false;
  } else {
    productionSeasonOptionsFilter.value = [];
  }
};

const getAllList = async () => {
  const res = await listPestDiseaseReport();
  productionSeasonAllList.value = res.rows ?? [];
};

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;

    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query, status: CroppingSeasonStatus.InProgress.toString() });
    productionSeasonList.value = res.rows;
    productionSeasonOptions.value = res.rows.map((item) => ({
      value: item.prodSeasonId,
      label: `${item.prodSeasonId}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

/** 查询病虫害报告列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPestDiseaseReport(queryParams.value);
  pestDiseaseReportList.value = res.rows;
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
  pestDiseaseReportFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PestDiseaseReportVO[]) => {
  ids.value = selection.map((item) => item.pestId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'PestDiseaseReportAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: PestDiseaseReportVO) => {
  const _pestId = row?.pestId || ids.value[0];
  router.push({ name: 'PestDiseaseReportEdit', params: { id: _pestId } });
};

/** 提交按钮 */
const submitForm = () => {
  preparePestTypeOnSubmit();
  pestDiseaseReportFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PestDiseaseStatus.Reported.toString();

      if (form.value.pestId) {
        await updatePestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PestDiseaseReportVO) => {
  const _pestIds = row?.pestId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delPestDiseaseReport(_pestIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/pestDiseaseReport/export',
    {
      ...queryParams.value
    },
    `pestDiseaseReport_${new Date().getTime()}.xlsx`
  );
};

const handleView = (row?: PestDiseaseReportVO) => {
  const _pestId = row?.pestId || ids.value[0];
  router.push({ name: 'PestDiseaseReportDetail', params: { id: _pestId } });
};

const isViewFlag = (data) => {
  return (
    data.status == PestDiseaseStatus.Approved.toString() ||
    data.status == PestDiseaseStatus.Rejected ||
    data.status == PestDiseaseStatus.Actioned.toString() ||
    data.status == PestDiseaseStatus.Closed.toString()
  );
};

onMounted(async () => {
  await getAllList();
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

