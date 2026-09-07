<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Farmland ID" prop="farmlandId">
              <el-select
                v-model="queryParams.farmlandId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmLandRemoteMethod"
                :loading="farmLandLoading"
                :debounce="300"
              >
                <el-option v-for="item in farmLandOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="soilProfileList" @selection-change="handleSelectionChange">
        <el-table-column label="Profile ID" align="center" prop="soilProfileId" v-if="true" :min-width="getColumnWidth('Profile ID')" />
        <el-table-column label="Farmland ID" align="center" prop="farmlandId" :min-width="getColumnWidth('Farmland ID')" />
        <el-table-column label="Sample Date" align="center" prop="sampleDate" width="180" :min-width="getColumnWidth('Sample Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sampleDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Soil pH" align="center" prop="ph" :min-width="getColumnWidth('Soil pH')" />
        <el-table-column label="Organic Matter (%)" align="center" prop="organicMatterPct" :min-width="getColumnWidth('Organic Matter (%)')" />
        <el-table-column label="N Level (kg/ha)" align="center" prop="nlevel" :min-width="getColumnWidth('N Level (kg/ha)')" />
        <el-table-column label="P Level (kg/ha)" align="center" prop="plevel" :min-width="getColumnWidth('P Level (kg/ha)')" />
        <el-table-column label="K Level (kg/ha)" align="center" prop="klevel" :min-width="getColumnWidth('K Level (kg/ha)')" />
        <template v-for="col in extendedColumns" :key="col.prop">
          <el-table-column
            v-if="col.type === 'dict'"
            :label="col.label"
            :prop="col.prop"
            align="center"
            :min-width="getColumnWidth(col.label)"
          >
            <template #default="scope">
              <dict-tag :options="dictMap[col.dictKey!]" :value="scope.row[col.prop]" />
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.type === 'soilType'"
            :label="col.label"
            :prop="col.prop"
            align="center"
            :min-width="getColumnWidth(col.label)"
          >
            <template #default="scope">
              <span>{{ getSoilTypeName(scope.row[col.prop]) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-else :label="col.label" :prop="col.prop" align="center" :min-width="getColumnWidth(col.label)" />
        </template>
        <el-table-column label="Remark" align="center" prop="remark" :min-width="getColumnWidth('Remark')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Created Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Created Date')">
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
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="scope.row.status != ApprovalStatus.Draft.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button
              v-else
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleApprove(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="SoilProfileVerify" lang="ts">
import { listSoilProfile } from '@/api/demo/soilProfile';
import { SoilProfileQuery, SoilProfileVO } from '@/api/demo/soilProfile/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';
import { normalizeSoilProfileRecord, soilProfileExtendedColumns } from '@/views/demo/soilProfile/constants';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const {
  soil_structure,
  drainage_status,
  erosion_risk_level,
  salinization_risk,
  acidification_trend,
  soil_compaction_trend
} = toRefs<any>(
  proxy?.useDict(
    'soil_structure',
    'drainage_status',
    'erosion_risk_level',
    'salinization_risk',
    'acidification_trend',
    'soil_compaction_trend'
  )
);

const extendedColumns = soilProfileExtendedColumns;

const dictMap = computed<Record<string, any[]>>(() => ({
  soil_structure: soil_structure.value || [],
  drainage_status: drainage_status.value || [],
  erosion_risk_level: erosion_risk_level.value || [],
  salinization_risk: salinization_risk.value || [],
  acidification_trend: acidification_trend.value || [],
  soil_compaction_trend: soil_compaction_trend.value || []
}));

const soilTypeOptions = ref<SoilTypeMasterVO[]>([]);
const soilTypeNameMap = computed(() =>
  soilTypeOptions.value.reduce<Record<string, string>>((map, item) => {
    if (item.soilCode) {
      map[item.soilCode] = item.soilName;
    }
    return map;
  }, {})
);

const getSoilTypeName = (code?: string) => {
  if (!code) return '';
  return soilTypeNameMap.value[code] || code;
};

const soilProfileList = ref<SoilProfileVO[]>([]);
const soilAllProfileList = ref<SoilProfileVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    farmlandId: undefined,
    sampleDate: undefined,
    ph: undefined,
    organicMatterPct: undefined,
    nLevel: undefined,
    pLevel: undefined,
    kLevel: undefined,
    deptId: undefined,
    status: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  } as SoilProfileQuery
});

const { queryParams } = toRefs(data);

const farmLandOptions = ref([]);
const farmLandList = ref([]);
const farmLandLoading = ref(false);
const farmLandRemoteMethod = async (query: string) => {
  if (query) {
    farmLandLoading.value = true;
    farmLandList.value = [
      ...new Set(
        soilAllProfileList.value.filter((f) => f.farmlandId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.farmlandId)
      )
    ];

    farmLandOptions.value = farmLandList.value.map((item) => ({
      value: item,
      label: item
    }));
    farmLandLoading.value = false;
  } else {
    farmLandOptions.value = [];
  }
};

/** Query Soil Profile Approval List */
const getList = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: '/demo/soilProfile/list/approved',
      method: 'get',
      params: queryParams.value
    });
    soilProfileList.value = (res.rows || []).map((row) => normalizeSoilProfileRecord(row as SoilProfileVO));
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

/** Query All Soil Profile List */
const getAllList = async () => {
  const res = await listSoilProfile();
  soilAllProfileList.value = (res.rows || []).map((row) => normalizeSoilProfileRecord(row as SoilProfileVO));
};

const refreshTable = async () => {
  loading.value = true;
  try {
    const res = await request({
      url: '/demo/soilProfile/list/approved',
      method: 'get',
      params: queryParams.value
    });
    soilProfileList.value = (res.rows || []).map((row) => normalizeSoilProfileRecord(row as SoilProfileVO));
    total.value = res.total;
    await getAllList();
  } finally {
    loading.value = false;
  }
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

/** Multi-select Change */
const handleSelectionChange = (selection: SoilProfileVO[]) => {
  ids.value = selection.map((item) => item.soilProfileId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const navigateToForm = (row: SoilProfileVO, mode: 'view' | 'approve', title: string) => {
  router.push({
    path: `${route.path}/form`,
    query: {
      soilProfileId: String(row.soilProfileId),
      mode,
      title
    }
  });
};

/** Check - view approved/rejected record */
const handleView = (row?: SoilProfileVO) => {
  const target = row || soilProfileList.value.find((item) => item.soilProfileId === ids.value[0]);
  if (!target) return;
  navigateToForm(target, 'view', 'View Soil Profile');
};

/** Editor - approve draft record */
const handleApprove = (row?: SoilProfileVO) => {
  const target = row || soilProfileList.value.find((item) => item.soilProfileId === ids.value[0]);
  if (!target) return;
  navigateToForm(target, 'approve', 'Approval Soil Profile');
};

onMounted(async () => {
  const res = await listSoilTypeMaster({ pageNum: 1, pageSize: 2000 });
  soilTypeOptions.value = res.rows || [];
  await refreshTable();
});

onActivated(async () => {
  if (route.query.refresh === '1') {
    queryParams.value.pageNum = 1;
    router.replace({ path: route.path });
  }
  await refreshTable();
});
</script>

