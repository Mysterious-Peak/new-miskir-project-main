<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="clusterFormRef" :model="form" :rules="rules" label-width="auto">
        <div class="flex items-end justify-between gap-4 flex-wrap">
          <div class="flex items-end gap-4 flex-wrap">
            <el-form-item label="Cluster ID" prop="clusterId" style="width: 280px" v-show="!!form.id">
              <el-input v-model="form.clusterId" placeholder="Cluster ID" disabled />
            </el-form-item>
            <el-form-item label="Cluster Name" prop="clusterName" style="width: 420px">
              <el-input v-model="form.clusterName" placeholder="Please input Cluster Name" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="Kebele ID" prop="kebeleId" style="width: 420px">
              <el-select
                v-model="form.kebeleId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="kebeleFormRemoteMethod"
                :loading="kebeleFormLoading"
                :debounce="300"
                clearable
                style="width: 100%"
                @change="handleKebeleChange"
              >
                <el-option v-for="item in kebeleFormOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="!!form.id" label="Status" prop="status" style="width: 280px">
              <el-select v-model="form.status" placeholder="Please select Status">
                <el-option v-for="item in clusterStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </div>
          <div class="flex items-center justify-center gap-2 mb-[18px]">
            <el-button @click="cancel">Cancel</el-button>
            <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
          </div>
        </div>

        <el-card shadow="never" class="mb-3" style="border: 1px solid #dcdfe6 !important">
          <div class="flex items-center gap-3 mb-2 flex-nowrap overflow-x-auto">
            <div class="font-semibold whitespace-nowrap min-w-fit" style="margin-top: -20px">Parcel Data</div>
            <el-form :model="availableQueryParams" :inline="true" label-width="auto" class="flex-1 whitespace-nowrap min-w-max">
              <el-form-item label="Parcel ID">
                <el-select
                  v-model="availableQueryParams.farmlandId"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="Please input"
                  :remote-method="availableParcelIdRemoteMethod"
                  :debounce="300"
                  clearable
                  style="width: 190px"
                >
                  <el-option v-for="item in availableParcelIdOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="Farmer ID">
                <el-select
                  v-model="availableQueryParams.farmerId"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="Please input"
                  :remote-method="availableFarmerIdRemoteMethod"
                  :debounce="300"
                  clearable
                  style="width: 190px"
                >
                  <el-option v-for="item in availableFarmerIdOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQueryAvailable">Search</el-button>
                <el-button icon="Refresh" @click="resetAvailableQuery">Reset</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-if="!form.kebeleId" class="mb-2 text-sm text-orange-500">Enter Kebele ID above to load available parcels</div>
          <el-table v-loading="parcelLoading" stripe fit border row-key="farmlandId" :data="filteredUnifiedParcels" max-height="320">
            <el-table-column width="55" align="center">
              <template #header>
                <el-checkbox :model-value="allVisibleParcelsSelected" :indeterminate="someVisibleParcelsSelected" @change="toggleAllVisibleParcels" />
              </template>
              <template #default="scope">
                <el-checkbox
                  :model-value="isParcelSelected(scope.row)"
                  :disabled="scope.row.occupied"
                  @change="(checked) => handleParcelCheckboxChange(scope.row, checked)"
                  @click.stop
                />
              </template>
            </el-table-column>
            <el-table-column label="Parcel ID" align="center" prop="farmlandId" width="110" />
            <el-table-column label="Farmer ID" align="center" prop="farmerId" />
            <el-table-column label="Farmer" align="center" prop="farmerName" />
            <el-table-column label="Area (ha)" align="center" prop="areaTa" width="100" />
            <el-table-column label="Status" align="center" width="140">
              <template #default="scope">
                <el-tag v-if="scope.row.occupied" type="danger">In {{ scope.row.occupiedClusterId }}</el-tag>
                <el-tag v-else type="success">Available</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt-4 text-right">
            Selected Area (ha): <span class="font-semibold">{{ selectedAreaTotal.toFixed(2) }}</span>
            <span class="ml-4">Selected Parcels: {{ selectedParcelList.length }}</span>
          </div>
        </el-card>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="ClusterFarmingForm" lang="ts">
import {
  addClusterFarming,
  getClusterFarming,
  listAvailableFarmlands,
  listClusterKebeleOptions,
  updateClusterFarming
} from '@/api/demo/clusterFarming';
import { ClusterFarmingForm, ClusterParcelVO } from '@/api/demo/clusterFarming/types';
import { ClusterStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const clusterFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const allParcels = ref<ClusterParcelVO[]>([]);
const selectedParcelList = ref<ClusterParcelVO[]>([]);
const availableFilterApplied = ref(false);
const parcelLoading = ref(false);

const availableQueryParams = reactive({
  farmlandId: undefined as string | undefined,
  farmerId: undefined as string | undefined
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

const form = ref<ClusterFarmingForm>({ ...initFormData });

const rules = {
  clusterName: [{ required: true, message: 'Cluster Name cannot be empty', trigger: 'blur' }],
  kebeleId: [{ required: true, message: 'Kebele ID cannot be empty', trigger: 'change' }]
};

const clusterStatusOptions = [
  { label: 'Draft', value: ClusterStatus.Draft.toString() },
  { label: 'Active', value: ClusterStatus.Active.toString() },
  { label: 'Inactive', value: ClusterStatus.Inactive.toString() }
];

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

/** Load record for edit mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData, status: ClusterStatus.Draft.toString() };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getClusterFarming(id.value);
    Object.assign(form.value, res.data);
    selectedParcelList.value = [...(res.data.parcels || [])];
    ensureKebeleFormOption(form.value.kebeleId);
    if (form.value.kebeleId) {
      await loadAvailableParcels();
    }
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
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
        router.push({ path: listPath.value, query: { refresh: '1' } });
      })
      .finally(() => {
        buttonLoading.value = false;
      });
  });
};

onMounted(() => {
  loadRecord();
});
</script>
