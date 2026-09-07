<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add / Edit Land Preparation Record Dialog -->
      <el-form ref="landPreparationAdvancedFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-select
            v-model="form.prodSeasonId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productionSeasonRemoteMethod"
            :loading="productionSeasonLoading"
            :debounce="300"
            @change="handleProductionSeasonSelect"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Preparation Date" prop="prepDate">
          <el-date-picker
            clearable
            v-model="form.prepDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Please select Preparation Date"
            :disabled="isViewFlag(form)"
            :disabled-date="disabledPastDate"
          />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="form.landprepId && isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item v-if="!isViewFlag(form)">
          <el-button type="primary" icon="Plus" @click="handleAddOperation">Add</el-button>
          <span v-if="operationList.length > 0" class="ml-auto text-gray-500">frequency of operations: {{ operationList.length }}</span>
        </el-form-item>
        <el-form-item>
          <el-table :data="operationList" stripe border max-height="300">
            <template #empty>No operations</template>
            <el-table-column label="Preparation Method" align="center" width="160">
              <template #default="scope">
                <span>{{ dictLabel(land_method, scope.row.method) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Operation Date" align="center" width="150">
              <template #default="scope">
                <span>{{ scope.row.operationDate || form.prepDate || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Machinery Used" align="center" width="140">
              <template #default="scope">
                <span>{{ dictLabel(land_machinery_used, scope.row.machineryUsed) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Tillage Depth (cm)" align="center" prop="depthCm" width="140" />
            <el-table-column label="Remarks" align="center" prop="remark" />
            <el-table-column label="Action" align="center" fixed="right" width="230">
              <template #default="scope">
                <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleEditOperation(scope.row, scope.$index)">Edit</el-button>
                <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDeleteOperation(scope.$index)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>

      <!-- Add / Edit Operation Dialog -->
      <el-card v-if="operationEditorVisible" shadow="never" class="operation-inline-editor">
        <template #header>
          <span>{{ operationForm.operationId || operationForm._editIndex !== undefined ? 'Update Operation' : 'Add Operation' }}</span>
        </template>
        <el-form ref="operationFormRef" :model="operationForm" :rules="operationRules" label-width="auto">
          <el-form-item label="Operation Date" prop="operationDate">
            <el-date-picker
              v-model="operationForm.operationDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select Operation Date"
              clearable
            />
          </el-form-item>
          <el-form-item label="Preparation Method" prop="method">
            <el-select v-model="operationForm.method" placeholder="Please select" @change="onMethodChange">
              <el-option v-for="dict in land_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Machinery Used" prop="machineryUsed">
            <el-select v-model="operationForm.machineryUsed" placeholder="Please select" :disabled="!operationForm.method">
              <el-option v-for="dict in allowedMachinery" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Tillage Depth (cm)" prop="depthCm">
            <el-input-number style="width: 100%" v-model="operationForm.depthCm" :min="0" :max="999.99" placeholder="Please enter Tillage Depth (cm)" />
          </el-form-item>
          <el-form-item label="Remarks" prop="remark">
            <el-input v-model="operationForm.remark" type="textarea" placeholder="Please enter content" />
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <el-button :loading="operationButtonLoading" type="primary" @click="submitOperation">
            {{
              operationForm.operationId || operationForm._editIndex !== undefined ? 'Update Operation' : 'Add Operation'
            }}
          </el-button>
          <el-button @click="operationEditorVisible = false">Cancel</el-button>
        </div>
      </el-card>

      <div class="form-footer">
        <el-button @click="cancel" v-if="!isViewFlag(form)">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm" v-if="!isViewFlag(form)">Save</el-button>
        <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="LandPreparationAdvancedForm" lang="ts">
import { getCroppingPlan } from '@/api/demo/croppingPlan';
import {
  addLandPreparationAdvanced,
  getLandPreparationAdvanced,
  updateLandPreparationAdvanced,
  listOperation,
  addOperation,
  delOperationByLandprepId
} from '@/api/demo/landPreparationAdvanced';
import {
  LandPreparationAdvancedForm,
  LandPreparationOperationVO,
  LandPreparationOperationForm
} from '@/api/demo/landPreparationAdvanced/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const landPreparationAdvancedFormRef = ref<ElFormInstance>();
const operationFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

// Operation table data (client-side list before save)
const operationList = ref<(LandPreparationOperationVO & { _localId?: number })[]>([]);
let localIdCounter = 0;
const operationButtonLoading = ref(false);
const operationEditorVisible = ref(false);

// Method → Machinery mapping (using dict values)
const methodMachineryMap: Record<string, string[]> = {
  '0': ['1', '2'],       // Plowing → Tractor, Oxen
  '1': ['1', '2'],       // Harrowing → Tractor, Oxen
  '2': ['1'],            // Rotavating → Tractor
  '3': ['1', '2', '0'],  // Leveling → Tractor, Oxen, Hoe
  '4': ['1', '0'],       // Bed formation → Tractor, Hoe
  '5': ['0']             // Minimum disturbance → Hoe
};

const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));

const initOperationForm: LandPreparationOperationForm & { _editIndex?: number } = {
  operationId: undefined,
  landprepId: undefined,
  operationDate: undefined,
  method: '',
  machineryUsed: '',
  depthCm: undefined,
  remark: ''
};

const operationForm = ref<LandPreparationOperationForm & { _editIndex?: number }>({ ...initOperationForm });

const operationRules = {
  operationDate: [{ required: true, message: 'Operation date cannot be empty', trigger: 'change' }],
  method: [{ required: true, message: 'Preparation method cannot be empty', trigger: 'change' }],
  machineryUsed: [{ required: true, message: 'Machinery used cannot be empty', trigger: 'change' }]
};

// Allowed machinery based on selected method
const allowedMachinery = computed(() => {
  const method = operationForm.value.method;
  if (!method || !methodMachineryMap[method]) return [];
  const allowed = methodMachineryMap[method];
  return (land_machinery_used.value || []).filter((dict: any) => allowed.includes(dict.value));
});

const onMethodChange = () => {
  operationForm.value.machineryUsed = '';
};

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);

const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;
    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query });
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

const selectedProductionSeasonYear = ref<number | undefined>(undefined);
const selectedProductionSeasonPlanId = ref<number | string | undefined>(undefined);
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);

const handleProductionSeasonSelect = async (prodSeasonId: string | number) => {
  if (form.value.prodSeasonId) {
    form.value.prepDate = undefined;
  }
  let selectedSeason = productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId);
  if (!selectedSeason && prodSeasonId) {
    try {
      const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: String(prodSeasonId) });
      if (res.rows && res.rows.length > 0) {
        selectedSeason = res.rows[0];
        if (!productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId)) {
          productionSeasonList.value.push(selectedSeason);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Production Season:', error);
    }
  }
  if (!selectedSeason) {
    selectedProductionSeasonYear.value = undefined;
    selectedProductionSeasonPlanId.value = undefined;
    startDate.value = undefined;
    endDate.value = undefined;
    return;
  }
  selectedProductionSeasonYear.value = selectedSeason.year ? parseInt(selectedSeason.year, 10) : undefined;
  selectedProductionSeasonPlanId.value = selectedSeason.planId;
  if (selectedProductionSeasonPlanId.value) {
    try {
      const res = await getCroppingPlan(selectedProductionSeasonPlanId.value.toString());
      const planData = res.data;
      if (planData) {
        startDate.value = planData.plantingWindowStart;
        endDate.value = planData.plantingWindowEnd;
      } else {
        startDate.value = undefined;
        endDate.value = undefined;
      }
    } catch (error) {
      console.error('Failed to get cropping plan:', error);
      startDate.value = undefined;
      endDate.value = undefined;
    }
  } else {
    startDate.value = undefined;
    endDate.value = undefined;
  }
};

const disabledPastDate = (time: Date) => {
  if (startDate.value && endDate.value) {
    const timeValue = time.getTime();
    const startTime = new Date(startDate.value).getTime();
    const endTime = new Date(endDate.value).getTime();
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);
    if (timeValue < minTime || timeValue > maxTime) return true;
    return false;
  }
  return true;
};

const initFormData: LandPreparationAdvancedForm = {
  landprepId: undefined,
  prodSeasonId: undefined,
  prepDate: undefined,
  method: [] as any,
  machineryUsed: undefined,
  depthCm: undefined,
  recordedBy: undefined,
  verifiedBy: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined
};

const form = ref<LandPreparationAdvancedForm>({ ...initFormData });

const rules = {
  prodSeasonId: [{ required: true, message: 'Related production season ID cannot be empty', trigger: 'blur' }],
  prepDate: [{ required: true, message: 'Preparation date cannot be empty', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorder ID cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
};

const dictLabel = (dictList: any[], value: string) => {
  const item = dictList?.find((d: any) => d.value === value);
  return item?.label || value || '';
};

const isViewFlag = (data: any) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    operationList.value = [];
    selectedProductionSeasonYear.value = undefined;
    selectedProductionSeasonPlanId.value = undefined;
    startDate.value = undefined;
    endDate.value = undefined;
    form.value.recordedBy = userStore.userId?.toString() || '';
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getLandPreparationAdvanced(id.value);
    Object.assign(form.value, res.data);
    // Load operations
    try {
      const opRes = await listOperation(id.value);
      operationList.value = ((opRes as any).data || []).map((operation: LandPreparationOperationVO) => ({
        ...operation,
        operationDate: operation.operationDate || form.value.prepDate
      }));
    } catch (e) {
      operationList.value = [];
    }
  } finally {
    pageLoading.value = false;
  }
};

// ==================== Operation CRUD ====================

const handleAddOperation = () => {
  operationForm.value = { ...initOperationForm, _editIndex: undefined };
  operationEditorVisible.value = true;
};

const handleEditOperation = (row: any, index: number) => {
  operationForm.value = {
    operationId: row.operationId,
    landprepId: row.landprepId || form.value.landprepId,
    // Legacy operation rows predate operation_date; use the parent date until
    // the row is explicitly updated with its own activity date.
    operationDate: row.operationDate || form.value.prepDate,
    method: row.method,
    machineryUsed: row.machineryUsed,
    depthCm: row.depthCm,
    remark: row.remark,
    _editIndex: index
  };
  operationEditorVisible.value = true;
};

const handleDeleteOperation = (index: number) => {
  operationList.value.splice(index, 1);
};

const submitOperation = async () => {
  operationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      operationButtonLoading.value = true;
      try {
        const data: any = { ...operationForm.value };
        if (data._editIndex !== undefined && data._editIndex !== null) {
          // Edit existing row in local list
          const idx = data._editIndex;
          delete data._editIndex;
          operationList.value[idx] = { ...data };
        } else {
          // Add new row to local list
          delete data._editIndex;
          data._localId = --localIdCounter;
          operationList.value.push(data);
        }
        operationEditorVisible.value = false;
      } finally {
        operationButtonLoading.value = false;
      }
    }
  });
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
const submitForm = () => {
  landPreparationAdvancedFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Draft.toString();
      const submitData: any = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',');
      }
      try {
        if (form.value.landprepId) {
          await updateLandPreparationAdvanced(submitData);
        } else {
          const res = await addLandPreparationAdvanced(submitData);
          const newLandprepId = (res as any)?.data;
          if (newLandprepId) {
            form.value.landprepId = newLandprepId;
          }
        }
        // Batch save all operations
        const landprepId = form.value.landprepId;
        if (landprepId) {
          // Delete all existing operations for this record
          await delOperationByLandprepId(landprepId);
          // Re-insert all operations from local list
          for (const op of operationList.value) {
            await addOperation({
              landprepId,
              operationDate: op.operationDate || form.value.prepDate,
              method: op.method,
              machineryUsed: op.machineryUsed,
              depthCm: op.depthCm,
              remark: op.remark
            } as any);
          }
        }
        proxy?.$modal.msgSuccess('Operation successful');
        router.push({ path: listPath.value, query: { refresh: '1' } });
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

onMounted(() => {
  loadRecord();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
