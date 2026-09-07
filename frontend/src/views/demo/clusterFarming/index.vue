<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Cluster ID" prop="clusterId">
              <el-select
                v-model="queryParams.clusterId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="clusterIdRemoteMethod"
                :loading="clusterIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in clusterIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Cluster Name" prop="clusterName">
              <el-input prefix-icon="Search" v-model="queryParams.clusterName" placeholder="Please input Cluster Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Kebele ID" prop="kebeleId">
              <el-select
                v-model="queryParams.kebeleId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="kebeleIdRemoteMethod"
                :loading="kebeleIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in kebeleIdOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:clusterFarming:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="clusterList">
        <el-table-column label="Cluster ID" align="center" prop="clusterId" :min-width="getColumnWidth('Cluster ID')" />
        <el-table-column label="Cluster Name" align="center" prop="clusterName" :min-width="getColumnWidth('Cluster Name')" />
        <el-table-column label="Kebele ID" align="center" prop="kebeleId" :min-width="getColumnWidth('Kebele ID')" />
        <el-table-column label="Parcels" align="center" prop="parcelCount" width="90" />
        <el-table-column label="Total Area (ha)" align="center" prop="totalAreaTa" :min-width="getColumnWidth('Total Area (ha)')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ClusterStatus[scope.row.status as ClusterStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="320">
          <template #default="scope">
            <el-button
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              v-hasPermi="['demo:clusterFarming:query']"
              >View</el-button
            >
            <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)" v-hasPermi="['demo:clusterFarming:edit']"
              >Edit</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:clusterFarming:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

  </div>
</template>

<script setup name="ClusterFarming" lang="ts">
import {
  addClusterFarming,
  delClusterFarming,
  getClusterFarming,
  listAvailableFarmlands,
  listClusterFarming,
  listClusterKebeleOptions,
  updateClusterFarming
} from '@/api/demo/clusterFarming';
import { ClusterFarmingForm, ClusterFarmingQuery, ClusterFarmingVO, ClusterParcelVO } from '@/api/demo/clusterFarming/types';
import { ClusterStatus } from '@/enums/AgriculturalEnum';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const clusterList = ref<ClusterFarmingVO[]>([]);
const allParcels = ref<ClusterParcelVO[]>([]);
const selectedParcelList = ref<ClusterParcelVO[]>([]);
const availableFilterApplied = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const parcelLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const clusterFormRef = ref<ElFormInstance>();

const availableQueryParams = reactive({
  farmlandId: undefined as string | undefined,
  farmerId: undefined as string | undefined
});
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ClusterFarmingForm = {
  id: undefined,
  clusterId: undefined,
  clusterName: undefined,
  kebeleId: undefined,
  status: ClusterStatus.Draft.toString(),
  remark: undefined,
  farmlandIds: []
};

const data = reactive<PageData<ClusterFarmingForm, ClusterFarmingQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clusterId: undefined,
    clusterName: undefined,
    kebeleId: undefined,
    params: {}
  },
  rules: {
    clusterName: [{ required: true, message: 'Cluster Name cannot be empty', trigger: 'blur' }],
    kebeleId: [{ required: true, message: 'Kebele ID cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const clusterStatusOptions = [
  { label: 'Draft', value: ClusterStatus.Draft.toString() },
  { label: 'Active', value: ClusterStatus.Active.toString() },
  { label: 'Inactive', value: ClusterStatus.Inactive.toString() }
];

const clusterIdOptions = ref<Array<{ value: string; label: string }>>([]);
const clusterIdLoading = ref(false);
const clusterIdRemoteMethod = async (query: string) => {
  if (query) {
    clusterIdLoading.value = true;
    try {
      const res = await listClusterFarming({ pageNum: 1, pageSize: 10, clusterId: query.trim() });
      clusterIdOptions.value = (res.rows || []).map((item) => ({
        value: item.clusterId,
        label: item.clusterId
      }));
    } catch {
      clusterIdOptions.value = [];
    } finally {
      clusterIdLoading.value = false;
    }
  } else {
    clusterIdOptions.value = [];
  }
};

const kebeleFormOptions = ref<Array<{ value: string; label: string }>>([]);
const kebeleFormLoading = ref(false);
const kebeleFormRemoteMethod = async (query: string) => {
  if (query) {
    kebeleFormLoading.value = true;
    try {
      const res = await listClusterKebeleOptions(query.trim());
      kebeleFormOptions.value = (res.data || []).map((item) => ({
        value: item.kebeleId,
        label: item.kebeleId
      }));
    } catch {
      kebeleFormOptions.value = [];
    } finally {
      kebeleFormLoading.value = false;
    }
  } else {
    kebeleFormOptions.value = [];
  }
};

const ensureKebeleFormOption = (kebeleId?: string) => {
  if (!kebeleId) {
    return;
  }
  if (!kebeleFormOptions.value.some((item) => item.value === kebeleId)) {
    kebeleFormOptions.value = [{ value: kebeleId, label: kebeleId }];
  }
};

type LocalSelectOption = { value: string; label: string };

const buildLocalSelectOptions = (source: ClusterParcelVO[], field: 'farmlandId' | 'farmerId', query: string, limit = 10): LocalSelectOption[] => {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return [];
  }
  const seen = new Set<string>();
  const options: LocalSelectOption[] = [];
  for (const item of source) {
    const raw = field === 'farmlandId' ? item.farmlandId : item.farmerId;
    if (raw == null || raw === '') {
      continue;
    }
    const value = String(raw);
    if (!value.toLowerCase().includes(keyword) || seen.has(value)) {
      continue;
    }
    seen.add(value);
    options.push({ value, label: value });
    if (options.length >= limit) {
      break;
    }
  }
  return options;
};

const availableParcelBaseList = computed(() => allParcels.value);

const availableParcelIdOptions = ref<LocalSelectOption[]>([]);
const availableFarmerIdOptions = ref<LocalSelectOption[]>([]);
const availableParcelIdRemoteMethod = (query: string) => {
  availableParcelIdOptions.value = query ? buildLocalSelectOptions(availableParcelBaseList.value, 'farmlandId', query) : [];
};
const availableFarmerIdRemoteMethod = (query: string) => {
  availableFarmerIdOptions.value = query ? buildLocalSelectOptions(availableParcelBaseList.value, 'farmerId', query) : [];
};

const kebeleIdOptions = ref<Array<{ value: string; label: string }>>([]);
const kebeleIdLoading = ref(false);
const kebeleIdRemoteMethod = async (query: string) => {
  if (query) {
    kebeleIdLoading.value = true;
    try {
      const res = await listClusterFarming({ pageNum: 1, pageSize: 10, kebeleId: query.trim() });
      const seen = new Set<string>();
      kebeleIdOptions.value = (res.rows || [])
        .filter((item) => {
          if (!item.kebeleId || seen.has(item.kebeleId)) {
            return false;
          }
          seen.add(item.kebeleId);
          return true;
        })
        .map((item) => ({
          value: item.kebeleId,
          label: item.kebeleId
        }));
    } catch {
      kebeleIdOptions.value = [];
    } finally {
      kebeleIdLoading.value = false;
    }
  } else {
    kebeleIdOptions.value = [];
  }
};

const filteredUnifiedParcels = computed(() => {
  let list = allParcels.value;
  if (availableFilterApplied.value) {
    list = list.filter((item) => {
      const matchParcel = !availableQueryParams.farmlandId || String(item.farmlandId || '').includes(availableQueryParams.farmlandId);
      const matchFarmer = !availableQueryParams.farmerId || String(item.farmerId || '').includes(availableQueryParams.farmerId);
      return matchParcel && matchFarmer;
    });
  }
  return list;
});

const selectedAreaTotal = computed(() => selectedParcelList.value.reduce((sum, item) => sum + Number(item.areaTa || 0), 0));

const getList = async () => {
  loading.value = true;
  const res = await listClusterFarming(queryParams.value);
  clusterList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const loadAvailableParcels = async () => {
  if (!form.value.kebeleId) {
    allParcels.value = [];
    return;
  }
  parcelLoading.value = true;
  try {
    const res = await listAvailableFarmlands(form.value.kebeleId, form.value.id);
    allParcels.value = res.data || [];
  } finally {
    parcelLoading.value = false;
  }
};

const isParcelSelected = (row: ClusterParcelVO) => selectedParcelList.value.some((item) => String(item.farmlandId) === String(row.farmlandId));

const selectableVisibleParcels = computed(() => filteredUnifiedParcels.value.filter((item) => !item.occupied));

const allVisibleParcelsSelected = computed(() => {
  const rows = selectableVisibleParcels.value;
  return rows.length > 0 && rows.every((row) => isParcelSelected(row));
});

const someVisibleParcelsSelected = computed(() => {
  const rows = selectableVisibleParcels.value;
  const selectedCount = rows.filter((row) => isParcelSelected(row)).length;
  return selectedCount > 0 && selectedCount < rows.length;
});

const updateParcelSelection = (row: ClusterParcelVO, checked: boolean) => {
  const selectedById = new Map(selectedParcelList.value.map((item) => [String(item.farmlandId), item]));
  const id = String(row.farmlandId);
  if (checked) {
    selectedById.set(id, row);
  } else {
    selectedById.delete(id);
  }
  selectedParcelList.value = [...selectedById.values()];
};

const handleParcelCheckboxChange = (row: ClusterParcelVO, checked: boolean | string | number) => {
  updateParcelSelection(row, Boolean(checked));
};

const toggleAllVisibleParcels = (checked: boolean | string | number) => {
  const selectedById = new Map(selectedParcelList.value.map((item) => [String(item.farmlandId), item]));
  selectableVisibleParcels.value.forEach((row) => {
    const id = String(row.farmlandId);
    if (Boolean(checked)) {
      selectedById.set(id, row);
    } else {
      selectedById.delete(id);
    }
  });
  selectedParcelList.value = [...selectedById.values()];
};

const handleQueryAvailable = () => {
  availableFilterApplied.value = true;
};

const resetAvailableQuery = () => {
  availableQueryParams.farmlandId = undefined;
  availableQueryParams.farmerId = undefined;
  availableFilterApplied.value = false;
  availableParcelIdOptions.value = [];
  availableFarmerIdOptions.value = [];
};

const handleKebeleChange = () => {
  selectedParcelList.value = [];
  availableFilterApplied.value = false;
  resetAvailableQuery();
  if (form.value.kebeleId?.trim()) {
    loadAvailableParcels();
  } else {
    allParcels.value = [];
  }
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const resetDialog = () => {
  allParcels.value = [];
  selectedParcelList.value = [];
  availableFilterApplied.value = false;
  availableQueryParams.farmlandId = undefined;
  availableQueryParams.farmerId = undefined;
  availableParcelIdOptions.value = [];
  availableFarmerIdOptions.value = [];
  kebeleFormOptions.value = [];
};

const reset = () => {
  form.value = { ...initFormData, status: ClusterStatus.Draft.toString() };
  clusterFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleAdd = () => {
  router.push({ name: 'ClusterFarmingAdd' });
};

const handleUpdate = (row: ClusterFarmingVO) => {
  router.push({ name: 'ClusterFarmingEdit', params: { id: row.id } });
};

const handleView = (row: ClusterFarmingVO) => {
  router.push({
    path: 'clusterFarmingDetail',
    query: { id: String(row.id) }
  });
};

const submitForm = () => {
  clusterFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    if (!form.value.kebeleId?.trim()) {
      proxy?.$modal.msgError('Please enter Kebele ID');
      return;
    }
    if (selectedParcelList.value.length === 0) {
      if (!allParcels.value.length && form.value.kebeleId?.trim()) {
        await loadAvailableParcels();
      }
      proxy?.$modal.msgError('Please select at least one parcel');
      return;
    }
    form.value.farmlandIds = selectedParcelList.value.map((item) => item.farmlandId);
    if (!form.value.id) {
      form.value.status = ClusterStatus.Draft.toString();
    }
    buttonLoading.value = true;
    const req = form.value.id ? updateClusterFarming(form.value) : addClusterFarming(form.value);
    req
      .then(async () => {
        proxy?.$modal.msgSuccess('Success');
        dialog.visible = false;
        await getList();
      })
      .finally(() => {
        buttonLoading.value = false;
      });
  });
};

const handleDelete = async (row: ClusterFarmingVO) => {
  await proxy?.$modal.confirm('Are you sure delete this cluster?');
  await delClusterFarming(row.id);
  proxy?.$modal.msgSuccess('Success');
  await getList();
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

