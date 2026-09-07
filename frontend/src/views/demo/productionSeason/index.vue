<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="prodSeasonRemoteMethod"
                :loading="prodSeasonLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in prodSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Plan ID" prop="planId">
              <!-- <el-input v-model="queryParams.planId" placeholder="Please input " clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.planId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="planRemoteMethod"
                :loading="planLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in planOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="FarmLand ID" prop="farmlandId">
              <!-- <el-input v-model="queryParams.farmlandId" placeholder="Please input " clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.farmlandId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmLandRemoteMethod"
                :loading="farmLandLoading"
                :debounce="300"
              >
                <el-option v-for="item in farmLandOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Crop Type" prop="cropId">
              <!-- <el-select v-model="queryParams.cropId" placeholder="Please select" clearable>
                <el-option v-for="dict in cropDataList" :key="dict.id" :label="dict.cropName" :value="dict.id"></el-option>
              </el-select> -->
              <el-select
                v-model="queryParams.cropId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="cropCodeRemoteMethod"
                :loading="cropCodeLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in cropCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Season" prop="seasonId">
              <el-select v-model="queryParams.seasonId" placeholder="Please select" clearable>
                <el-option v-for="dict in seasonDataList" :key="dict.id" :label="dict.seasonName" :value="dict.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Year" prop="year">
              <el-input prefix-icon="Search" v-model="queryParams.year" placeholder="Please input " clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Area" prop="areaHa">
              <el-input v-model="queryParams.areaHa" placeholder="请输入实际种植面积" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Start Date" prop="startDate">
              <el-date-picker clearable v-model="queryParams.startDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择实际开始日期" />
            </el-form-item>
            <el-form-item label="End Date" prop="endDate">
              <el-date-picker clearable v-model="queryParams.endDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择实际结束日期" />
            </el-form-item> -->
            <!-- <el-form-item label="部门ID" prop="deptId">
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" >Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Edit</el-button
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

      <el-table v-loading="loading" stripe fit border :data="productionSeasonList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column
          label="Production Season ID"
          align="center"
          prop="prodSeasonId"
          v-if="true"
          :min-width="getColumnWidth('Production Season')"
        />
        <el-table-column label="Plan ID" align="center" prop="planId" :min-width="getColumnWidth('Plan ID')" />
        <el-table-column label="FarmLand ID" align="center" prop="farmlandId" :min-width="getColumnWidth('FarmLand ID')" />
        <el-table-column label="Crop Type" align="center" prop="cropId" :formatter="cropFormatter" :min-width="getColumnWidth('Crop Type')" />
        <el-table-column label="Season" align="center" prop="seasonId" :formatter="seasonFormatter" :min-width="getColumnWidth('Season')" />
        <el-table-column label="Year" align="center" prop="year" :min-width="getColumnWidth('Year')" />
        <el-table-column label="Area" align="center" :min-width="getColumnWidth('Area')">
          <template #default="scope">
            <span>{{ formatAreaColumn(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" sortable :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ CroppingSeasonStatus[scope.row.status as CroppingSeasonStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Created Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Created Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Start Date" align="center" prop="startDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="End Date" align="center" prop="endDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="部门ID" align="center" prop="deptId" /> -->
        <!-- <el-table-column label="Remark" align="center" prop="remark" /> -->
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="scope.row.status == CroppingSeasonStatus.Planned.toString()"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
            <el-button
              v-if="scope.row.status != CroppingSeasonStatus.Planned.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              >View</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改生产季节对话框 -->
  </div>
</template>

<script setup name="ProductionSeason" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { listFarmland } from '@/api/demo/farmland';
import {
  addProductionSeason,
  delProductionSeason,
  getProductionSeason,
  listProductionSeason,
  updateProductionSeason
} from '@/api/demo/productionSeason';
import { ProductionSeasonForm, ProductionSeasonQuery, ProductionSeasonVO } from '@/api/demo/productionSeason/types';
import { listSeasonMaster } from '@/api/demo/seasonMaster';
import { CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const productionSeasonList = ref<ProductionSeasonVO[]>([]);
const productionSeasonAllList = ref<ProductionSeasonVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const isView = ref(false);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const productionSeasonFormRef = ref<ElFormInstance>();

const statusOptions = [
  { value: CroppingSeasonStatus.Planned.toString(), label: 'Planned' },
  { value: CroppingSeasonStatus.InProgress.toString(), label: 'InProgress' },
  { value: CroppingSeasonStatus.Completed.toString(), label: 'Completed' }
  // { value: CroppingSeasonStatus.Cancelled.toString(), label: 'Cancelled' }
];

// const filteredStatusOptions = computed(() => {
//   if (form.value.status === CroppingSeasonStatus.Planned.toString()) {
//     return statusOptions.filter((item) => item.value !== CroppingSeasonStatus.Completed.toString());
//   } else if (form.value.status === CroppingSeasonStatus.Cancelled.toString()) {
//     return statusOptions.filter(
//       (item) => item.value !== CroppingSeasonStatus.InProgress.toString() && item.value !== CroppingSeasonStatus.Completed.toString()
//     );
//   }
// });

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProductionSeasonForm = {
  prodSeasonId: undefined,
  prodSeasonCode: undefined,
  planId: undefined,
  farmlandId: undefined,
  cropId: undefined,
  seasonId: undefined,
  year: undefined,
  areaTa: undefined,
  status: '0',
  createdUserName: undefined,
  createTime: undefined,
  deptId: undefined,
  remark: undefined
};
const data = reactive<PageData<ProductionSeasonForm, ProductionSeasonQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    planId: undefined,
    farmlandId: undefined,
    cropId: undefined,
    seasonId: undefined,
    year: undefined,
    areaTa: undefined,
    status: undefined,
    createdUserName: undefined,
    createTime: undefined,
    deptId: undefined,
    params: {},
    // orderByColumn: 'status',
    // isAsc: 'asc'
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    // prodSeasonId: [{ required: true, message: ' can not be null', trigger: 'blur' }],
    planId: [{ required: true, message: 'Plan ID can not be null', trigger: 'blur' }],
    farmlandId: [{ required: true, message: 'FarmLand ID can not be null', trigger: 'blur' }],
    cropId: [{ required: true, message: 'Crop ID can not be null', trigger: 'blur' }],
    seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
    year: [{ required: true, message: 'Year can not be null', trigger: 'blur' }],
    areaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const farmLandOptions = ref([]);
const farmLandList = ref([]);
const farmLandLoading = ref(false);
const farmLandRemoteMethod = async (query: string) => {
  if (query) {
    farmLandList.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.farmlandId?.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.farmlandId)
      )
    ];
    farmLandLoading.value = true;
    farmLandOptions.value = farmLandList.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    farmLandLoading.value = false;
  } else {
    farmLandOptions.value = [];
  }
};

const planOptions = ref([]);
const planList = ref([]);
const planLoading = ref(false);
const planRemoteMethod = async (query: string) => {
  if (query) {
    planList.value = [
      ...new Set(
        productionSeasonAllList.value.filter((f) => f.planId?.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.planId)
      )
    ];
    planLoading.value = true;
    planOptions.value = planList.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    planLoading.value = false;
  } else {
    planOptions.value = [];
  }
};

const prodSeasonOptions = ref([]);
const prodSeasonCodeList = ref([]);
const prodSeasonLoading = ref(false);
const prodSeasonRemoteMethod = async (query: string) => {
  if (query) {
    prodSeasonCodeList.value = productionSeasonAllList.value
      .filter((f) => f.prodSeasonId?.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.prodSeasonId);
    prodSeasonLoading.value = true;
    prodSeasonOptions.value = prodSeasonCodeList.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    prodSeasonLoading.value = false;
  } else {
    prodSeasonOptions.value = [];
  }
};

const cropCodeOptions = ref([]);
const cropCodeList = ref([]);
const cropCodeLoading = ref(false);
const cropCodeRemoteMethod = async (query: string) => {
  if (query) {
    const q = query.toLowerCase();
    cropCodeList.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => {
            const code = getCropCodeById(f.cropId);
            const name = getCropNameByProductionRef(f.cropId);
            return code.toLowerCase().includes(q) || name.toLowerCase().includes(q) || f.cropId?.toString().toLowerCase().includes(q);
          })
          .map((item) => item.cropId)
      )
    ];
    cropCodeLoading.value = true;
    cropCodeOptions.value = cropCodeList.value.map((item) => ({
      value: item,
      label: getCropNameByProductionRef(item)
    }));
    cropCodeLoading.value = false;
  } else {
    cropCodeOptions.value = [];
  }
};

/** 将接口 rows/data 统一为数组，避免单条对象等导致表格行错位 */
const normalizeListRows = (res: any): ProductionSeasonVO[] => {
  const raw = res?.rows ?? res?.data;
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') return [raw] as ProductionSeasonVO[];
  return [];
};

const formatAreaColumn = (row: ProductionSeasonVO) => {
  const v = (row as any).areaTa ?? (row as any).areaHa;
  if (v === undefined || v === null || v === '') return '';
  return String(v);
};

/** 查询生产季节列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res: any = await listProductionSeason(queryParams.value);
    const rows = normalizeListRows(res);
    productionSeasonList.value = rows;
    const t = res?.total;
    total.value = t != null && t !== '' && !Number.isNaN(Number(t)) ? Number(t) : rows.length;
  } finally {
    loading.value = false;
  }
};

/** 查询生产季节全量列表（供远程筛选本地过滤使用） */
const getAllList = async () => {
  const res: any = await listProductionSeason();
  productionSeasonAllList.value = normalizeListRows(res);
  console.log('getAllList res', res, 'rows', productionSeasonAllList.value);
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  productionSeasonFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProductionSeasonVO[]) => {
  ids.value = selection.map((item) => item.prodSeasonId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  isView.value = false;
  dialog.visible = true;
  dialog.title = 'Add Production Season';
};

/** 修改按钮操作 */
const handleUpdate = (row?: ProductionSeasonVO) => {
  const _prodSeasonId = row?.prodSeasonId || ids.value[0];
  router.push({ name: 'ProductionSeasonEdit', params: { id: _prodSeasonId } });
};
const handleView = (row?: ProductionSeasonVO) => {
  const _prodSeasonId = row?.prodSeasonId || ids.value[0];
  router.push({ name: 'ProductionSeasonDetail', params: { id: _prodSeasonId } });
};

/** 提交按钮 */
const submitForm = () => {
  productionSeasonFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.prodSeasonId) {
        await updateProductionSeason(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addProductionSeason(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ProductionSeasonVO) => {
  const _prodSeasonIds = row?.prodSeasonId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delProductionSeason(_prodSeasonIds);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/productionSeason/export',
    {
      ...queryParams.value
    },
    `productionSeason_${new Date().getTime()}.xlsx`
  );
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 2000 });
  cropDataList.value = res.rows;
};
const seasonDataList = ref();
const getSeasonList = async () => {
  const res = await listSeasonMaster({ pageNum: 1, pageSize: 2000 });
  seasonDataList.value = res.rows;
};

/** 禁止 .find() 为 undefined 时读 .cropName，否则会抛错并导致 el-table 整行错列 */
const cropFormatter = (row: ProductionSeasonVO) => {
  const list = cropDataList.value;
  if (row == null) return '—';
  if (row.cropId === undefined || row.cropId === null || row.cropId === '') return '—';
  if (!list?.length) return String(row.cropId);
  const key = String(row.cropId);
  const found = list.find((item) => String(item.id) === key || String(item.cropCode) === key);
  return found?.cropName ?? String(row.cropId);
};

const seasonFormatter = (row: ProductionSeasonVO) => {
  const list = seasonDataList.value;
  if (row == null) return '—';
  if (row.seasonId === undefined || row.seasonId === null || row.seasonId === '') return '—';
  if (!list?.length) return String(row.seasonId);
  const key = String(row.seasonId);
  const found = list.find((item) => String(item.id) === key || String(item.seasonCode) === key);
  return found?.seasonName ?? String(row.seasonId);
};
const getCropNameById = (cropId: string | number | undefined) => {
  if (cropId === undefined || cropId === null || cropId === '') {
    return '';
  }
  return cropDataList.value?.find((item) => String(item.id) === String(cropId))?.cropName || String(cropId);
};

/** Resolve master Crop Type for a production row's cropId (same id/code lookup as table formatter). */
const getCropCodeById = (cropId: string | number | undefined) => {
  if (cropId === undefined || cropId === null || cropId === '') {
    return '';
  }
  const list = cropDataList.value;
  if (!list?.length) return String(cropId);
  const key = String(cropId);
  const found = list.find((item) => String(item.id) === key || String(item.cropCode) === key);
  return found?.cropCode ?? String(cropId);
};

/** Same lookup as getCropCodeById; returns cropName for select labels (aligns with table column). */
const getCropNameByProductionRef = (cropId: string | number | undefined) => {
  if (cropId === undefined || cropId === null || cropId === '') {
    return '';
  }
  const list = cropDataList.value;
  if (!list?.length) return String(cropId);
  const key = String(cropId);
  const found = list.find((item) => String(item.id) === key || String(item.cropCode) === key);
  return found?.cropName ?? String(cropId);
};
const getSeasonNameById = (seasonId: string | number | undefined) => {
  if (seasonId === undefined || seasonId === null || seasonId === '') {
    return '';
  }
  return seasonDataList.value?.find((item) => String(item.id) === String(seasonId))?.seasonName || String(seasonId);
};

onMounted(async () => {
  await getCropList();
  await getSeasonList();
  await getAllList();
  await getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

