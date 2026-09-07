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
                :remote-method="productionSeasonRemoteMethod"
                :loading="productionSeasonLoading"
                :debounce="300"
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" >Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Approval</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" >导出</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="harvestList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Harvest ID" align="center" prop="harvestId" v-if="true" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" />
        <el-table-column label="Harvest Date" align="center" prop="harvestDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.harvestDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Harested Area (ha)" align="center" prop="harvestedAreaTa" />
        <el-table-column label="Harvest Yield (q)" align="center" prop="actualYieldQt" />
        <el-table-column label="Moisture (%)" align="center" prop="moisturePct" />
        <el-table-column label="Quality Grade" align="center" prop="qualityGrade">
          <template #default="scope">
            <dict-tag :options="harvest_quality_grade" :value="scope.row.qualityGrade" />
          </template>
        </el-table-column>
        <el-table-column label="Methods" align="center" prop="methods">
          <template #default="scope">
            <dict-tag :options="harvest_methods" :value="scope.row.methods" />
          </template>
        </el-table-column>
        <el-table-column label="Buyer Name" align="center" prop="buyerName" />
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" />
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Create By" align="center" prop="createBy" /> -->
        <el-table-column label="Create Date" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="verifiedUserName" />
        <el-table-column label="Approved Date" align="center" prop="verifiedAt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.verifiedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" />
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="View" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click="handleUpdate(scope.row)"
                v-if="scope.row.status != ApprovalStatus.Draft.toString()"
              ></el-button>
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-if="scope.row.status == ApprovalStatus.Draft.toString()"
              ></el-button>
            </el-tooltip>
            <!-- <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" ></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="Harvest Approval" lang="ts">
import { listHarvest, getHarvest, delHarvest, addHarvest, updateHarvest } from '@/api/demo/harvest';
import { HarvestVO, HarvestQuery, HarvestForm } from '@/api/demo/harvest/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import SelectProductionSeason from '@/components/FarmLand/SelectProductionSeason.vue';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { harvest_quality_grade, harvest_date, harvest_methods } = toRefs<any>(
  proxy?.useDict('harvest_quality_grade', 'harvest_date', 'harvest_methods')
);

const harvestList = ref<HarvestVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const harvestFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: HarvestForm = {
  harvestId: undefined,
  prodSeasonId: undefined,
  harvestDate: undefined,
  harvestedAreaTa: undefined,
  actualYieldQt: undefined,
  moisturePct: undefined,
  qualityGrade: undefined,
  buyerName: undefined,
  recordedBy: undefined,
  recordedUserName: undefined,
  verifiedBy: undefined,
  verifiedUserName: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  createBy: undefined,
  createTime: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<HarvestForm, HarvestQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    harvestDate: undefined,
    harvestedAreaTa: undefined,
    actualYieldQt: undefined,
    moisturePct: undefined,
    qualityGrade: undefined,
    buyerName: undefined,
    recordedBy: undefined,
    verifiedBy: undefined,
    verifiedAt: undefined,
    deptId: undefined,
    status: undefined,
    params: {},
    // orderByColumn: 'createTime',
    // isAsc: 'desc'
    orderByColumn: undefined,
    isAsc: undefined
  },
  rules: {
    // harvestId: [{ required: true, message: '收获ID不能为空', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
    harvestDate: [{ required: true, message: 'Harvest Date can not be null', trigger: 'blur' }],
    actualYieldQt: [{ required: true, message: 'Actual Yield can not be null', trigger: 'blur' }],
    recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

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

/** 查询收获记录列表 */
const getList = async () => {
  loading.value = true;
  // const res = await listHarvest(queryParams.value);
  const res = await request({
    url: '/demo/harvest/list/approved',
    method: 'get',
    params: queryParams.value
  });
  harvestList.value = res.rows;
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
  harvestFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: HarvestVO[]) => {
  ids.value = selection.map((item) => item.harvestId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Harvest';
};

/** 修改按钮操作 */
const handleUpdate = (row?: HarvestVO) => {
  const _harvestId = row?.harvestId || ids.value[0];
  if (row?.status == ApprovalStatus.Draft.toString()) {
    router.push({ name: 'HarvestVerifiedApprove', params: { id: _harvestId } });
  } else {
    router.push({ name: 'HarvestVerifiedDetail', params: { id: _harvestId } });
  }
};

/** 提交按钮 */
const submitForm = () => {
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Approved.toString();

      if (form.value.harvestId) {
        await updateHarvest(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addHarvest(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};
const rejectForm = () => {
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.harvestId) {
        await updateHarvest(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addHarvest(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.harvestId) {
        await updateHarvest(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addHarvest(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: HarvestVO) => {
  const _harvestIds = row?.harvestId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delHarvest(_harvestIds);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/harvest/export',
    {
      ...queryParams.value
    },
    `harvest_${new Date().getTime()}.xlsx`
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

