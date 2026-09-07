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
                clearable
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Variety name" prop="seedLotCode">
              <el-input
                maxlength="30"
                v-model="queryParams.seedLotCode"
                placeholder="Please enter Variety name"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Sowing Date" prop="sowingDate">
              <el-date-picker
                clearable
                v-model="queryParams.sowingDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Sowing Date"
              />
            </el-form-item>
            <!-- <el-form-item label="Seed Type (e.g. Obsa-23)" prop="seedType">
              <el-input v-model="queryParams.seedType" placeholder="Please enter Seed Type (e.g. Obsa-23)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Quantity" prop="seedRateKg">
              <el-input v-model="queryParams.seedRateKg" placeholder="Please enter Quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Spacing (cm)" prop="spacingCm">
              <el-input v-model="queryParams.spacingCm" placeholder="Please enter Spacing (cm)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Method" prop="method">
              <el-input v-model="queryParams.method" placeholder="Please enter Method" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Recorded By ID" prop="recordedBy">
              <el-input v-model="queryParams.recordedBy" placeholder="Please enter Recorded By ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Department ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="Please enter Department ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:sowing:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:sowing:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:sowing:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:sowing:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="sowingList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Sowing Record ID" align="center" prop="sowingId" v-if="true" :min-width="getColumnWidth('Sowing Record ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Crop Type" align="center" prop="seedType" :min-width="getColumnWidth('Crop Type')">
          <template #default="scope">
            <dict-tag :options="sowingSeedTypeTagOptions" :value="scope.row.seedType" />
          </template>
        </el-table-column>
        <el-table-column label="Variety name" align="center" prop="seedLotCode" :min-width="getColumnWidth('Variety name')">
          <template #default="scope">
            <dict-tag :options="sowingVarietyTagOptions" :value="scope.row.seedLotCode" />
          </template>
        </el-table-column>
        <el-table-column label="Quantity" align="center" prop="seedRateKg" :min-width="getColumnWidth('Quantity')" />
        <el-table-column label="Method" align="center" prop="method" :min-width="getColumnWidth('Method')">
          <template #default="scope">
            <dict-tag :options="sowing_method" :value="scope.row.method" />
          </template>
        </el-table-column>
        <el-table-column label="Row Spacing (cm)" align="center" prop="spacingCm" :min-width="getColumnWidth('Row Spacing (cm)')" />
        <el-table-column label="Plant Spacing (cm)" align="center" prop="plantSpacingCm" :min-width="getColumnWidth('Plant Spacing (cm)')" />
        <el-table-column label="Sowing Date" align="center" prop="sowingDate" :min-width="getColumnWidth('Sowing Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sowingDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
        <!-- <el-table-column label="Department ID" align="center" prop="deptId" />
        <el-table-column label="Remark" align="center" prop="remark" /> -->
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Sowing Record Dialog -->
  </div>
</template>

<script setup name="Sowing" lang="ts">
import { listSowing, getSowing, delSowing, addSowing, updateSowing, listSowingApprove } from '@/api/demo/sowing';
import { SowingVO, SowingQuery, SowingForm } from '@/api/demo/sowing/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { getCropMaster } from '@/api/demo/cropMaster';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { sowing_variety_name, sowing_seed_type, sowing_method } = toRefs<any>(
  proxy?.useDict('sowing_variety_name', 'sowing_seed_type', 'sowing_method')
);

const getMethodKind = (method?: string | number) => {
  if (method === undefined || method === null || method === '') return '';
  const dictItem = sowing_method.value?.find((item: any) => String(item.value) === String(method));
  const text = (dictItem?.label || String(method)).toLowerCase();
  if (text.includes('broadcast')) return 'broadcast';
  if (text.includes('transplant')) return 'transplant';
  if (text.includes('row')) return 'row';
  return text;
};

const isSpacingRequired = (method?: string | number) => {
  const kind = getMethodKind(method);
  return kind === 'row' || kind === 'transplant';
};

const dynamicSeedTypeOptions = ref<any[]>([]);

/** Keep DB seedType value and backfill display option from Crop Master */
const ensureSeedTypeOptionByCurrentValue = async () => {
  const current = form.value.seedType;
  if (current === undefined || current === null || current === '') {
    dynamicSeedTypeOptions.value = [];
    return;
  }
  const value = String(current);
  try {
    const cropRes = await getCropMaster(value);
    const cropName = cropRes?.data?.cropName ? String(cropRes.data.cropName) : '';
    dynamicSeedTypeOptions.value = [{ label: cropName || value, value }];
  } catch (error) {
    console.error('Failed to backfill seedType option by current DB value:', value, error);
    dynamicSeedTypeOptions.value = [{ label: value, value }];
  }
};

const sowingList = ref<SowingVO[]>([]);
const sowingSeedTypeNameMap = ref<Record<string, string>>({});
const sowingVarietyTagOptions = computed(() =>
  Array.from(new Set((sowingList.value || []).map((item: any) => String(item.seedLotCode || '')).filter((item) => !!item))).map((item) => ({
    label: item,
    value: item
  }))
);
const sowingSeedTypeTagOptions = computed(() =>
  Array.from(new Set((sowingList.value || []).map((item: any) => String(item.seedType || '')).filter((item) => !!item))).map((item) => ({
    label: sowingSeedTypeNameMap.value[item] || item,
    value: item
  }))
);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const sowingFormRef = ref<ElFormInstance>();
const productionSeasonAllList = ref<SowingVO[]>([]);
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonList.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.prodSeasonId?.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.prodSeasonId)
      )
    ];
    productionSeasonLoading.value = true;
    productionSeasonOptions.value = productionSeasonList.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

const getAllList = async () => {
  const res = await listSowingApprove();
  productionSeasonAllList.value = res.rows ?? [];
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SowingForm = {
  sowingId: undefined,
  prodSeasonId: undefined,
  sowingDate: undefined,
  seedLotCode: undefined,
  seedType: undefined,
  seedRateKg: undefined,
  spacingCm: undefined,
  plantSpacingCm: undefined,
  method: undefined,
  recordedBy: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<SowingForm, SowingQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    sowingDate: undefined,
    seedLotCode: undefined,
    seedType: undefined,
    seedRateKg: undefined,
    spacingCm: undefined,
    method: undefined,
    recordedBy: undefined,
    deptId: undefined,
    status: ApprovalStatus.Draft.toString(),
    params: {
      // orderByColumn: 'createTime',
      // isAsc: 'desc'
    },
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    sowingId: [{ required: true, message: 'Sowing Record ID cannot be empty', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
    sowingDate: [{ required: true, message: 'Sowing Date cannot be empty', trigger: 'blur' }],
    seedLotCode: [{ required: true, message: 'Variety name cannot be empty', trigger: 'blur' }],
    seedType: [{ required: true, message: 'Crop Type cannot be empty', trigger: 'blur' }],
    seedRateKg: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }],
    method: [{ required: true, message: 'Method cannot be empty', trigger: 'blur' }],
    spacingCm: [],
    plantSpacingCm: [],
    recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const showSpacingFields = computed(() => isSpacingRequired(form.value.method));

const syncSpacingFormRules = () => {
  if (isSpacingRequired(form.value.method)) {
    rules.value.spacingCm = [{ required: true, message: 'Row Spacing (cm) cannot be empty', trigger: ['blur', 'change'] }];
    rules.value.plantSpacingCm = [{ required: true, message: 'Plant Spacing (cm) cannot be empty', trigger: ['blur', 'change'] }];
  } else {
    rules.value.spacingCm = [];
    rules.value.plantSpacingCm = [];
  }
};

watch(
  () => [form.value.method, sowing_method.value],
  () => syncSpacingFormRules(),
  { deep: true }
);

/** Query Sowing Record List */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listSowingApprove(queryParams.value);
    // Filter records with status = '0'
    // sowingList.value = res.rows.filter((item: any) => item.status === '0');
    sowingList.value = res.rows;
    const seedTypeIds = Array.from(new Set((res.rows || []).map((item: any) => String(item.seedType || '')).filter((item) => !!item)));
    const localSeedTypeNameMap: Record<string, string> = {};
    await Promise.all(
      seedTypeIds.map(async (id) => {
        try {
          const cropRes = await getCropMaster(id);
          const cropName = cropRes?.data?.cropName ? String(cropRes.data.cropName) : '';
          if (cropName) {
            localSeedTypeNameMap[id] = cropName;
          }
        } catch (error) {
          console.error('Failed to fetch Crop Master for seedType id:', id, error);
        }
      })
    );
    sowingSeedTypeNameMap.value = localSeedTypeNameMap;
    total.value = res.total;
  } catch (error) {
    console.error('Failed to fetch sowing list:', error);
    sowingList.value = [];
    sowingSeedTypeNameMap.value = {};
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  sowingFormRef.value?.resetFields();
};

/** Search Button Action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset Button Action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  // Restore status filter after reset
  queryParams.value.status = ApprovalStatus.Draft.toString();
  handleQuery();
};

/** Multi-select Change */
const handleSelectionChange = (selection: SowingVO[]) => {
  ids.value = selection.map((item) => item.sowingId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Sowing Record';
};

/** Edit Button Action */
const handleUpdate = (row?: SowingVO) => {
  const _sowingId = row?.sowingId || ids.value[0];
  router.push({ name: 'SowingApprove', params: { id: _sowingId } });
};

/** Submit Button */
const submitForm = () => {
  syncSpacingFormRules();
  sowingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      // form.value.verifiedAt = new Date().toLocaleString();
      if (form.value.sowingId) {
        await updateSowing(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowing(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  syncSpacingFormRules();
  sowingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.sowingId) {
        await updateSowing(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowing(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  syncSpacingFormRules();
  sowingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.sowingId) {
        await updateSowing(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowing(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: SowingVO) => {
  const _sowingIds = row?.sowingId || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Sowing Record with ID "' + _sowingIds + '"?').finally(() => (loading.value = false));
  await delSowing(_sowingIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/sowing/export',
    {
      ...queryParams.value
    },
    `sowing_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  await getAllList();
  await getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected || data.status == ApprovalStatus.NeedRevision;
};
</script>

