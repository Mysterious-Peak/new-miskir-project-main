<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="FarmLand ID" prop="farmlandId">
              <el-input prefix-icon="Search" v-model="queryParams.farmlandId" placeholder="Please input FarmLand ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Year" prop="year">
              <el-input v-model="queryParams.year" placeholder="Please input Year" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Crop Code" prop="cropCode">
              <el-input v-model="queryParams.cropCode" placeholder="Please input Crop Code" clearable @keyup.enter="handleQuery" />
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
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:croppingPlan:remove']"
              >Delete</el-button
            >
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="croppingPlanList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="planId" v-if="true" :min-width="getColumnWidth('ID')" />
        <el-table-column label="FarmLand ID" align="center" prop="farmlandId" :min-width="getColumnWidth('FarmLand ID')" />
        <el-table-column label="Season Name" align="center" prop="seasonName" :min-width="getColumnWidth('Season Name')" />
        <el-table-column label="Year" align="center" prop="year" :min-width="getColumnWidth('Year')" />
        <el-table-column label="Crop Code" align="center" prop="cropCode" :min-width="getColumnWidth('Crop Code')" />
        <el-table-column label="Area(ha)" align="center" prop="plannedAreaTa" :min-width="getColumnWidth('Area(ha)')" />
        <el-table-column label="Anticipated Yield" align="center" prop="plannedYieldQt" :min-width="getColumnWidth('Anticipated Yield')" />
        <el-table-column
          label="Planting Window Start"
          align="center"
          prop="plantingWindowStart"
          width="180"
          :min-width="getColumnWidth('Planting Window Start')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.plantingWindowStart, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Planting Window End"
          align="center"
          prop="plantingWindowEnd"
          width="180"
          :min-width="getColumnWidth('Planting Window End')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.plantingWindowEnd, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Harvest Window Start"
          align="center"
          prop="harvestWindowStart"
          width="180"
          :min-width="getColumnWidth('Harvest Window Start')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.harvestWindowStart, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Harvest Window End"
          align="center"
          prop="harvestWindowEnd"
          width="180"
          :min-width="getColumnWidth('Harvest Window End')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.harvestWindowEnd, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" width="120" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ CroppingPlanApprovalStatus[scope.row.status as CroppingPlanApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Aproved By" align="center" prop="approvedBy" :min-width="getColumnWidth('Aproved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Remark" align="center" prop="remark" /> -->
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Approval" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:croppingPlan:edit']"></el-button>
            </el-tooltip>
            <!-- <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:croppingPlan:remove']"></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改种植计划对话框 -->
  </div>
</template>

<script setup name="CroppingPlan Submit" lang="ts">
import { addCroppingPlan, delCroppingPlan, getCroppingPlan, listCroppingPlan, updateCroppingPlan } from '@/api/demo/croppingPlan';
import { CroppingPlanForm, CroppingPlanQuery, CroppingPlanVO } from '@/api/demo/croppingPlan/types';
import { CroppingPlanApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const croppingPlanList = ref<CroppingPlanVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const croppingPlanFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CroppingPlanForm = {
  planId: undefined,
  farmlandId: undefined,
  seasonId: undefined,
  year: undefined,
  cropCode: undefined,
  plannedAreaTa: undefined,
  plannedYieldQt: undefined,
  plantingWindowStart: undefined,
  plantingWindowEnd: undefined,
  harvestWindowStart: undefined,
  harvestWindowEnd: undefined,
  status: undefined,
  createdUserName: undefined,
  createTime: undefined,
  approvedBy: undefined,
  approvedAt: undefined,
  deptId: undefined,
  remark: undefined
};
const data = reactive<PageData<CroppingPlanForm, CroppingPlanQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    farmlandId: undefined,
    seasonId: undefined,
    year: undefined,
    cropCode: undefined,
    plannedAreaTa: undefined,
    plannedYieldQt: undefined,
    plantingWindowStart: undefined,
    plantingWindowEnd: undefined,
    harvestWindowStart: undefined,
    harvestWindowEnd: undefined,
    status: CroppingPlanApprovalStatus.Draft.toString(),
    createdUserName: undefined,
    createTime: undefined,
    approvedBy: undefined,
    approvedAt: undefined,
    deptId: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    // planId: [{ required: true, message: '自增ID不能为空', trigger: 'blur' }],

    farmlandId: [{ required: true, message: 'FarmLand ID can not be null', trigger: 'blur' }],
    seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
    year: [{ required: true, message: 'Year can not be null', trigger: 'blur' }],
    cropCode: [{ required: true, message: 'Crop Code can not be null', trigger: 'blur' }],
    plannedAreaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }],
    plannedYieldQt: [{ required: true, message: 'Yield can not be null', trigger: 'blur' }],
    plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'blur' }],
    plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'blur' }],
    harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'blur' }],
    harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'blur' }]
    // daCreatedBy: [{ required: true, message: '创建者不能为空', trigger: 'blur' }],
    // daCreatedAt: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询种植计划列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCroppingPlan(queryParams.value);
  croppingPlanList.value = res.rows;
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
  croppingPlanFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: CroppingPlanVO[]) => {
  ids.value = selection.map((item) => item.planId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add cropping plan';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: CroppingPlanVO) => {
  const _planId = row?.planId || ids.value[0];
  router.push({ name: 'SubmitCroppingPlan', params: { id: _planId } });
};

/** 提交按钮 */
const submitForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = CroppingPlanApprovalStatus.Submitted.toString();
      if (form.value.planId) {
        await updateCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = CroppingPlanApprovalStatus.Rejected.toString();
      if (form.value.planId) {
        await updateCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: CroppingPlanVO) => {
  const _planIds = row?.planId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data').finally(() => (loading.value = false));
  await delCroppingPlan(_planIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/croppingPlan/export',
    {
      ...queryParams.value
    },
    `croppingPlan_${new Date().getTime()}.xlsx`
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

