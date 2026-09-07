<template>
  <div class="p-2">
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Production Batch Information</span>
      </div>
      <el-form ref="productionBatchFormRef" :model="productionBatchForm" :rules="productionBatchFormRules" label-width="240px" label-position="right" class="w-full">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Production Batch Id" prop="productionBatchId">
              <el-select
                v-if="!productionBatchIdFromQuery"
                v-model="productionBatchForm.productionBatchId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input to search"
                :remote-method="productionBatchIdRemoteMethod"
                :loading="productionBatchIdLoading"
                :debounce="300"
                clearable
                @change="handleProductionBatchIdChange"
                style="width: 100%"
              >
                <el-option v-for="item in productionBatchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-input v-else v-model="productionBatchForm.productionBatchId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Processor Id">
              <el-input v-model="productionBatchForm.processorId" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Product Id">
              <el-input v-model="productionBatchForm.productId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Protocol Version">
              <el-input v-model="productionBatchForm.protocolVersion" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Start Time">
              <el-input v-model="productionBatchForm.startTime" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="End Time">
              <el-input v-model="productionBatchForm.endTime" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <!-- Process Steps Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center justify-between" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <div class="flex items-center">
          <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
          <span class="font-semibold">Process Steps Information</span>
        </div>
      </div>
      <el-table v-loading="loading" :data="processStepRunList" stripe fit border>
        <el-table-column label="Step Run ID" prop="stepRunId" align="center" :min-width="getColumnWidth('Step Run ID')" />
        <el-table-column label="Step Name" prop="stepName" align="center" :min-width="getColumnWidth('Step Name')" />
        <el-table-column label="Start Time" prop="startTime" align="center" width="180" :min-width="getColumnWidth('Start Time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="End Time" prop="endTime" align="center" width="180" :min-width="getColumnWidth('End Time')">
          <template #default="scope">
            <span v-if="scope.row.endTime">{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Operator ID" prop="operatorId" align="center" :min-width="getColumnWidth('Operator ID')" />
        <!-- <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="100">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="View" placement="top" v-if="!isViewFlag()">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column> -->
      </el-table>
    </el-card>

    <!-- Lab Test Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Quality Inspection</span>
      </div>

      <!-- Quality Inspection Information -->
      <el-form :model="qualityInspectionForm" label-width="180px" class="mb-2">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="Production Batch ID">
              <el-input v-model="qualityInspectionForm.productionBatchId" placeholder="Please input" clearable :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Inspection ID">
              <el-input v-model="qualityInspectionForm.inspectionId" placeholder="" clearable :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Inspector ID">
              <el-input placeholder="" clearable :disabled="true" v-model="qualityInspectionForm.inspectorId" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Inspection Date">
              <el-date-picker
                :disabled="true"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder=""
                clearable
                style="width: 100%"
                v-model="qualityInspectionForm.inspectionDate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Quality Score">
              <el-input-number placeholder="" style="width: 100%" :precision="2" :disabled="true" v-model="qualityInspectionForm.qualityScore" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Result">
              <el-select placeholder="" style="width: 100%" clearable :disabled="true" v-model="qualityInspectionForm.result">
                <el-option label="Pass" value="Pass" />
                <el-option label="Fail" value="Fail" />
                <el-option label="Pending" value="Pending" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Lab Test Information</span>
      </div> -->

      <!-- <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
        <el-button type="primary" plain icon="Plus" @click="openLabTestDialog">Add</el-button>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getLabTestList"></right-toolbar>
      </div> -->
      <!-- <el-table v-loading="labTestLoading" :data="labTestList" stripe fit border>
        <el-table-column label="Lab Test ID" prop="labTestId" align="center" :min-width="getColumnWidth('Lab Test ID')" />
        <el-table-column label="Inspection ID" prop="inspectionId" align="center" :min-width="getColumnWidth('Inspection ID')" />
        <el-table-column label="Test Parameter" prop="testParameter" align="center" :min-width="getColumnWidth('Test Parameter')" />
        <el-table-column label="Test Value" prop="testValue" align="center" :min-width="getColumnWidth('Test Value')" />
        <el-table-column label="Standard Limit" prop="standardLimit" align="center" :min-width="getColumnWidth('Standard Limit')" />
        <el-table-column label="Result" prop="result" align="center" :min-width="getColumnWidth('Result')">
          <template #default="scope">
            <el-tag
              :type="scope.row.result === 'Pass' ? 'success' : scope.row.result === 'Fail' ? 'danger' : 'info'"
            >
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleLabTestUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleLabTestDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table> -->
    </el-card>
    <!-- Lab Test 区域按钮（仅在编辑模式下显示，且只有 Cancel） -->
    <el-card style="margin-top: 10px" v-if="productionBatchIdFromQuery">
      <div class="dialog-footer" style="text-align: center">
        <el-button @click="handleLabTestCancel">Cancel</el-button>
      </div>
    </el-card>

    <!-- 新增模式：显示 Confirm / Cancel 按钮 -->
    <el-card shadow="hover" class="mt-2 mb-2" :body-style="{ padding: '12px 24px' }" v-if="!productionBatchIdFromQuery">
      <div class="dialog-footer" style="text-align: center">
        <el-button icon="SendPlane" type="primary" @click="handleSave">Submit</el-button>
        <el-button @click="handleCancel">Cancel</el-button>
      </div>
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <el-form ref="stepDialogFormRef" :model="stepDialogForm" :rules="stepDialogRules" label-width="auto">
        <el-form-item label="Step Run ID" prop="stepRunId" v-show="isShow">
          <el-input v-model="stepDialogForm.stepRunId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Step Name" prop="stepName">
          <el-input v-model="stepDialogForm.stepName" placeholder="Please input" :disabled="dialogAction === 'edit' || !isViewFlag()" clearable />
        </el-form-item>
        <el-form-item label="Start Time" prop="startTime">
          <el-date-picker
            clearable
            v-model="stepDialogForm.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select"
            :disabled="dialogAction === 'edit' || !isViewFlag()"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="End Time" prop="endTime">
          <el-date-picker
            clearable
            v-model="stepDialogForm.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select"
            :disabled="dialogAction === 'edit' || !isViewFlag()"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Operator ID" prop="operatorId">
          <el-input v-model="stepDialogForm.operatorId" placeholder="Please input" :disabled="dialogAction === 'edit' || !isViewFlag()" clearable />
        </el-form-item>
        <el-form-item prop="iotInformation" v-if="dialogAction === 'edit'">
          <el-form-item label-width="0" v-if="isViewFlag()">
            <el-button type="primary" plain icon="Plus" @click="openIotDialog" style="width: 150px !important">Add IOT Information</el-button>
          </el-form-item>
          <el-table :data="iotSensorReadingList" stripe fit border style="width: 100%">
            <el-table-column label="Sensor Reading ID" prop="sensorReadingId" align="center" :min-width="getColumnWidth('Sensor Reading ID')" />
            <el-table-column label="Sensor Type" prop="sensorType" align="center" :min-width="getColumnWidth('Sensor Type')" />
            <el-table-column label="Reading Value" prop="readingValue" align="center" :min-width="getColumnWidth('Reading Value')" />
            <el-table-column label="Reading Time" prop="readingTime" align="center" width="180" :min-width="getColumnWidth('Reading Time')">
              <template #default="scope">
                <span>{{ parseTime(scope.row.readingTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="primary" @click="handleStepDialogConfirm" v-if="isViewFlag() && dialogAction !== 'edit'">Save</el-button>
          <el-button @click="handleStepDialogCancel" v-if="isViewFlag() && dialogAction !== 'edit'">Cancel</el-button>
          <el-button @click="cancel" v-if="!isViewFlag() || dialogAction === 'edit'">Close</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Add Lab Test Dialog -->
    <el-dialog v-model="labTestDialog.visible" :title="labTestDialog.title" width="600px" append-to-body>
      <el-form ref="labTestDialogFormRef" :model="labTestDialogForm" :rules="labTestDialogRules" label-width="auto">
        <el-form-item label="Lab Test ID" prop="labTestId" v-if="labTestDialogAction === 'edit'">
          <el-input v-model="labTestDialogForm.labTestId" placeholder="Lab Test ID" disabled />
        </el-form-item>
        <el-form-item label="Inspection ID" prop="inspectionId">
          <el-select v-model="labTestDialogForm.inspectionId" filterable clearable placeholder="Please select" style="width: 100%">
            <el-option
              v-for="inspection in inspectionList"
              :key="inspection.inspectionId"
              :label="inspection.inspectionId"
              :value="inspection.inspectionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Test Parameter" prop="testParameter">
          <el-input v-model="labTestDialogForm.testParameter" placeholder="Please input" clearable />
        </el-form-item>
        <el-form-item label="Test Value" prop="testValue">
          <el-input-number v-model="labTestDialogForm.testValue" placeholder="Please input" style="width: 100%" :precision="2" />
        </el-form-item>
        <el-form-item label="Standard Limit" prop="standardLimit">
          <el-input-number v-model="labTestDialogForm.standardLimit" placeholder="Please input" style="width: 100%" :precision="2" />
        </el-form-item>
        <el-form-item label="Result" prop="result">
          <el-select v-model="labTestDialogForm.result" placeholder="Please select" style="width: 100%">
            <el-option label="Pass" value="Pass" />
            <el-option label="Fail" value="Fail" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="primary" @click="handleLabTestDialogConfirm" :loading="labTestButtonLoading">Save</el-button>
          <el-button @click="handleLabTestDialogCancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Add IOT Information Dialog -->
    <el-dialog v-model="iotDialog.visible" :title="iotDialog.title" width="600px" append-to-body>
      <el-form ref="iotDialogFormRef" :model="iotDialogForm" :rules="iotDialogRules" label-width="auto">
        <el-form-item label="Sensor Type" prop="sensorType">
          <el-input v-model="iotDialogForm.sensorType" placeholder="Please input" clearable />
        </el-form-item>
        <el-form-item label="Reading Value" prop="readingValue">
          <el-input-number v-model="iotDialogForm.readingValue" placeholder="Please input" style="width: 220px" />
        </el-form-item>
        <el-form-item label="Reading Time" prop="readingTime">
          <el-date-picker
            clearable
            v-model="iotDialogForm.readingTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button type="primary" @click="handleIotDialogConfirm" :loading="iotButtonLoading">Save</el-button>
          <el-button @click="handleIotDialogCancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ProcessingOperations" lang="ts">
import { nextTick } from 'vue';
import { addIotSensorReading, listIotSensorReading } from '@/api/demo/iotSensorReading';
import { addProcessStepRuns, delProcessStepRuns, listProcessStepRuns, updateProcessStepRuns } from '@/api/demo/processStepRuns';
import { getProductionBatch, updateProductionBatchWithSteps, listProductionBatch } from '@/api/demo/productionBatch';
import type { ProductionBatchForm, ProductionBatchVO } from '@/api/demo/productionBatch/types';
import { addLabTest, listLabTest, updateLabTest, delLabTest } from '@/api/demo/labTest';
import { addQualityInspectionProcess, listQualityInspectionProcess } from '@/api/demo/qualityInspectionProcess';
import type { QualityInspectionProcessForm } from '@/api/demo/qualityInspectionProcess/types';
import { ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';
import { InfoFilled } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userStore = useUserStore();
const buttonLoading = ref(false);
// 表格 loading 初始为 false，避免新增模式下一直转圈
const loading = ref(false);

// Production Batch ID 远程搜索（参考 productionBatch/index.vue）
const productionBatchIdFromQuery = ref(false);
const productionBatchIdOptions = ref<Array<{ value: string | number; label: string }>>([]);
const productionBatchAllList = ref<ProductionBatchVO[]>([]);
const productionBatchIdLoading = ref(false);

// 根据路由参数判断是 new 还是 view/edit 模式
// 从 add 按钮进来的（没有 productionBatchId）是 isNewMode
// 从 table 点击进来的（有 productionBatchId）是 isViewMode
const isNewMode = computed(() => {
  const productionBatchId = proxy.$route.query.productionBatchId as string | undefined;
  return !productionBatchId; // 没有 productionBatchId 则为 new 模式
});

const isViewMode = computed(() => {
  const productionBatchId = proxy.$route.query.productionBatchId as string | undefined;
  return !!productionBatchId; // 有 productionBatchId 则为 view/edit 模式
});

// 一次性加载全部 Production Batch，用于本地模糊过滤
const loadAllProductionBatch = async () => {
  if (productionBatchAllList.value.length) return;
  try {
    const res: any = await listProductionBatch();
    const rows = res?.rows ?? res;
    productionBatchAllList.value = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Failed to load all production batches:', error);
    productionBatchAllList.value = [];
  }
};

const productionBatchIdRemoteMethod = async (query: string) => {
  if (query) {
    // 确保已经加载了所有批次数据
    if (!productionBatchAllList.value.length) {
      await loadAllProductionBatch();
    }
    productionBatchIdLoading.value = true;
    const filteredIds = productionBatchAllList.value
      .filter((f) => {
        // 只显示 status 为 '4' 的数据
        return f.status === '4' && f.productionBatchId?.toString().toLowerCase().includes(query.toLowerCase());
      })
      .map((item) => item.productionBatchId as string | number);

    productionBatchIdOptions.value = filteredIds.map((id) => ({
      value: id,
      label: String(id)
    }));
    productionBatchIdLoading.value = false;
  } else {
    productionBatchIdOptions.value = [];
  }
};

// 当选择 Production Batch ID 后加载数据
const handleProductionBatchIdChange = async (productionBatchId: string | number) => {
  if (!productionBatchId) {
    // 清空表单和表格
    productionBatchForm.value = {
      productionBatchId: undefined,
      processorId: undefined,
      productId: undefined,
      protocolVersion: undefined,
      startTime: undefined,
      endTime: undefined,
      status: undefined
    };
    processStepRunList.value = [];
    qualityInspectionForm.value = { ...initialQualityInspectionFormData };
    return;
  }

  try {
    // 加载 Production Batch 信息
    const { data: productionBatchInfo } = await getProductionBatch(productionBatchId);
    productionBatchForm.value = productionBatchInfo;

    // 加载 Process Steps
    await getProcessStepRunList(productionBatchId);

    // 加载 Quality Inspection 数据
    await getLabTestList(productionBatchId);
  } catch (error) {
    console.error('Failed to load production batch data:', error);
    proxy?.$modal.msgError('Failed to load production batch data');
  }
};

const initialStepFormData = {
  stepRunId: undefined,
  productionBatchId: undefined,
  stepName: undefined,
  startTime: undefined,
  endTime: undefined,
  operatorId: undefined
};

// Production Batch Information
const productionBatchFormRef = ref<ElFormInstance>();
const productionBatchFormRules = {
  productionBatchId: [
    { required: true, message: 'Please select Production Batch Id', trigger: 'change' }
  ]
};
const productionBatchForm = ref<ProductionBatchForm>({
  productionBatchId: undefined,
  processorId: undefined,
  productId: undefined,
  protocolVersion: undefined,
  startTime: undefined,
  endTime: undefined,
  status: undefined
});

// Process Steps Information
const processStepRunList = ref<any[]>([]);

// Lab Test Information
const labTestList = ref<any[]>([]);
const labTestLoading = ref(false);
const inspectionList = ref<any[]>([]);
const showSearch = ref(true);

// Quality Inspection Information (for Lab Test section)
const initialQualityInspectionFormData = {
  inspectionId: undefined,
  productionBatchId: undefined,
  inspectorId: undefined,
  inspectionDate: undefined,
  qualityScore: undefined,
  status: undefined,
  result:undefined
};
const qualityInspectionForm = ref({ ...initialQualityInspectionFormData });

// Lab Test Dialog
const labTestDialog = reactive<DialogOption>({
  visible: false,
  title: 'Add Lab Test'
});
const labTestDialogAction = ref<'add' | 'edit'>('add');

const labTestDialogFormRef = ref<ElFormInstance>();
const initialLabTestFormData = {
  labTestId: undefined,
  inspectionId: undefined,
  testParameter: undefined,
  testValue: undefined,
  standardLimit: undefined,
  result: undefined
};
const labTestDialogForm = ref({ ...initialLabTestFormData });
const labTestButtonLoading = ref(false);

const labTestDialogRules = {
  inspectionId: [{ required: false, message: 'Inspection ID cannot be empty', trigger: 'change' }],
  testParameter: [{ required: true, message: 'Test Parameter cannot be empty', trigger: 'blur' }],
  testValue: [{ required: true, message: 'Test Value cannot be empty', trigger: 'blur' }],
  standardLimit: [{ required: true, message: 'Standard Limit cannot be empty', trigger: 'blur' }],
  result: [{ required: true, message: 'Result cannot be empty', trigger: 'change' }]
};

// IoT Sensor Reading Information
const iotSensorReadingList = ref<any[]>([]);

// IoT Dialog
const iotDialog = reactive<DialogOption>({
  visible: false,
  title: 'Add IOT Information'
});

const iotDialogFormRef = ref<ElFormInstance>();
const initialIotFormData = {
  sensorReadingId: undefined,
  stepRunId: undefined,
  sensorType: undefined,
  readingValue: undefined,
  readingTime: undefined
};
const iotDialogForm = ref({ ...initialIotFormData });
const iotButtonLoading = ref(false);

const iotDialogRules = {
  sensorType: [{ required: true, message: 'Sensor Type cannot be empty', trigger: 'blur' }],
  readingValue: [{ required: true, message: 'Reading Value cannot be empty', trigger: 'blur' }],
  readingTime: [{ required: true, message: 'Reading Time cannot be empty', trigger: 'blur' }]
};

// 步骤弹窗表单 & 校验
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const stepDialogFormRef = ref<ElFormInstance>();
const stepDialogForm = ref({ ...initialStepFormData });

const stepDialogRules = {
  stepName: [{ required: true, message: 'Step Name cannot be empty', trigger: 'blur' }],
  operatorId: [{ required: true, message: 'Operator ID cannot be empty', trigger: 'blur' }]
};

// 弹窗：确认
const handleStepDialogConfirm = () => {
  stepDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    stepDialogForm.value.productionBatchId = productionBatchForm.value.productionBatchId;

    if (stepDialogForm.value.stepRunId) {
      await updateProcessStepRuns(stepDialogForm.value).finally(() => (buttonLoading.value = false));
    } else {
      await addProcessStepRuns(stepDialogForm.value).finally(() => (buttonLoading.value = false));
    }
    dialog.visible = false;
    await getProcessStepRunList(stepDialogForm.value.productionBatchId);
    reset();
  });
};

// 弹窗：取消
const handleStepDialogCancel = () => {
  dialog.visible = false;
  reset();
};

const dialogAction = ref('');
const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

const openStepDialog = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Process Step';
  dialogAction.value = 'add';
};

/** 获取 IoT 传感器读数列表 */
const getIotSensorReadingList = async (stepRunId: string | number) => {
  if (!stepRunId) {
    iotSensorReadingList.value = [];
    return;
  }
  try {
    const res = await listIotSensorReading({
      stepRunId,
      pageNum: 1,
      pageSize: 1000
    });
    iotSensorReadingList.value = res.rows || [];
  } catch (error) {
    console.error('Failed to load IoT sensor readings:', error);
    iotSensorReadingList.value = [];
  }
};

/** 修改按钮操作 */
const handleUpdate = async (row?: any) => {
  reset();
  const _stepRunId = row?.stepRunId;
  const res = await listProcessStepRuns({
    productionBatchId: productionBatchForm.value.productionBatchId,
    pageNum: 1,
    pageSize: 1000
  });
  const step = res.rows.find((s) => s.stepRunId === _stepRunId);
  if (step) {
    Object.assign(stepDialogForm.value, step);
  }
  await getIotSensorReadingList(_stepRunId);
  dialog.visible = true;
  dialog.title = 'Edit Process Step';
  dialogAction.value = 'edit';
};

/** 删除按钮操作 */
const handleDelete = async (row?: any) => {
  const _stepRunId = row?.stepRunId;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delProcessStepRuns(_stepRunId);
  proxy?.$modal.msgSuccess('success');
  await getProcessStepRunList(productionBatchForm.value.productionBatchId);
};

/** 查看按钮操作 */
const handleView = async (row?: any) => {
  reset();
  const _stepRunId = row?.stepRunId;
  const res = await listProcessStepRuns({
    productionBatchId: productionBatchForm.value.productionBatchId,
    pageNum: 1,
    pageSize: 1000
  });
  const step = res.rows.find((s) => s.stepRunId === _stepRunId);
  if (step) {
    Object.assign(stepDialogForm.value, step);
  }
  await getIotSensorReadingList(_stepRunId);
  dialog.visible = true;
  dialog.title = 'View Process Step';
  dialogAction.value = 'view';
};

// 根据路由中的 productionBatchId 加载 / 切换数据
const loadByProductionBatchId = async (productionBatchId?: string | number) => {
  if (productionBatchId) {
    // 编辑模式：有 productionBatchId 查询参数
    productionBatchIdFromQuery.value = true;
    const { data: productionBatchInfo } = await getProductionBatch(productionBatchId);
    productionBatchForm.value = productionBatchInfo;

    await getProcessStepRunList(productionBatchId);
    await getLabTestList(productionBatchId);
  } else {
    // 新增模式：没有 productionBatchId 查询参数
    productionBatchIdFromQuery.value = false;
    productionBatchForm.value = {
      productionBatchId: undefined,
      processorId: undefined,
      productId: undefined,
      protocolVersion: undefined,
      startTime: undefined,
      endTime: undefined,
      status: undefined
    };
    processStepRunList.value = [];
    qualityInspectionForm.value = { ...initialQualityInspectionFormData };
    // 确保在 new 模式下，result 字段为空
    if (isNewMode.value) {
      qualityInspectionForm.value.result = 'Pending';
    }
  }
};

// 初始加载 + 监听路由参数变化（例如从列表页 Edit / Add 多次进入）
watch(
  () => proxy.$route.query.productionBatchId as string | undefined,
  (productionBatchId) => {
    loadByProductionBatchId(productionBatchId);
  },
  { immediate: true }
);

// 被 keep-alive 缓存时，每次激活也根据当前路由参数刷新一次
onActivated(() => {
  const productionBatchId = proxy.$route.query.productionBatchId as string | undefined;
  loadByProductionBatchId(productionBatchId);
});

// 初始化处理步骤表格
const getProcessStepRunList = async (productionBatchId: string | number) => {
  loading.value = true;
  try {
    const res = await listProcessStepRuns({
      productionBatchId,
      pageNum: 1,
      pageSize: 100,
      orderByColumn: 'startTime',
      isAsc: 'asc'
    });
    const rows = res.rows || [];
    processStepRunList.value = rows;
  } catch (error) {
    console.error('Failed to load process step runs:', error);
    processStepRunList.value = [];
  } finally {
    loading.value = false;
  }
};

// 初始化实验室测试表格
const getLabTestList = async (productionBatchId?: string | number) => {
  const _productionBatchId = productionBatchId || productionBatchForm.value.productionBatchId;
  if (!_productionBatchId) return;

  labTestLoading.value = true;
  try {
    // 先获取 inspection 列表用于下拉选择
    const inspectionRes = await listQualityInspectionProcess({
      productionBatchId: _productionBatchId,
      pageNum: 1,
      pageSize: 100
    });
    const inspections = inspectionRes.rows || [];
    inspectionList.value = inspections;

    // 如果是 new 模式，保持 Quality Inspection 的特定字段为空
    if (isNewMode.value) {
      // 只设置 productionBatchId，其他字段保持为空
      qualityInspectionForm.value.productionBatchId = _productionBatchId;
      qualityInspectionForm.value.inspectionId = undefined;
      qualityInspectionForm.value.inspectorId = undefined;
      qualityInspectionForm.value.inspectionDate = undefined;
      qualityInspectionForm.value.qualityScore = undefined;
      // result 字段在 new 模式下显示 'Pending'
      qualityInspectionForm.value.result = 'Pending';
      // status 保持默认值 'Pending'（如果之前设置过）
      if (!qualityInspectionForm.value.status) {
        qualityInspectionForm.value.status = 'Pending';
      }
    } else {
      // 非 new 模式：根据路由或传入的 inspectionId 精确定位当前质检记录（参考 qualityControlApproveDetail/index.vue）
      let targetInspection: any | undefined;
      const targetInspectionId = proxy.$route.query.inspectionId as string | undefined;

      console.log('Route inspectionId:', targetInspectionId);
      console.log('Inspections list:', inspections);

      if (targetInspectionId) {
        targetInspection = inspections.find((item: any) => item.inspectionId === targetInspectionId);
        console.log('Found by inspectionId:', targetInspection);
      }
      // 如果没有找到匹配项，则回退到第一条记录
      if (!targetInspection && inspections.length > 0) {
        targetInspection = inspections[0] as any;
        console.log('Using first inspection:', targetInspection);
      }

      if (targetInspection) {
        // 将后端的 result 值（'0', '1', '2'）转换为前端显示值（'Pass', 'Fail', 'Pending'）
        let resultValue: string | undefined = undefined;
        if (targetInspection.result !== undefined && targetInspection.result !== null && targetInspection.result !== '') {
          const resultStr = String(targetInspection.result);
          if (resultStr === '0') {
            resultValue = 'Pass';
          } else if (resultStr === '1') {
            resultValue = 'Fail';
          } else if (resultStr === '2') {
            resultValue = 'Pending';
          } else {
            // 如果已经是文本格式，直接使用
            resultValue = resultStr;
          }
        }
        
        // 调试：确认值
        console.log('Target Inspection:', targetInspection);
        console.log('Inspection ID:', targetInspection.inspectionId);
        console.log('Quality Score:', targetInspection.qualityScore, 'Type:', typeof targetInspection.qualityScore);
        console.log('Result:', targetInspection.result, 'Converted to:', resultValue);
        
        // 使用整个对象赋值，确保响应式更新（参考 qualityControlApproveDetail/index.vue）
        // 直接使用原始值，不做转换，让 el-input-number 自己处理
        qualityInspectionForm.value = {
          inspectionId: targetInspection.inspectionId || undefined, // 确保 inspectionId 被正确设置
          productionBatchId: targetInspection.productionBatchId || _productionBatchId,
          inspectorId: targetInspection.inspectorId,
          inspectionDate: targetInspection.inspectionDate,
          qualityScore: targetInspection.qualityScore, // 直接使用原始值
          status: targetInspection.status,
          result: resultValue
        };
        
        // 再次确认赋值后的值
        console.log('After assignment - Inspection ID:', qualityInspectionForm.value.inspectionId);
        
        // 根据当前 inspectionId 获取对应的 Lab Test 数据
        const res = await listLabTest({
          inspectionId: targetInspection.inspectionId,
          pageNum: 1,
          pageSize: 1000
        });
        labTestList.value = res.rows || [];
      } else {
        qualityInspectionForm.value = { ...initialQualityInspectionFormData };
        labTestList.value = [];
      }
    }
  } catch (error) {
    console.error('Failed to load lab tests:', error);
    labTestList.value = [];
  } finally {
    labTestLoading.value = false;
  }
};

/** 表单重置 */
const reset = () => {
  stepDialogForm.value = { ...initialStepFormData };
  iotSensorReadingList.value = [];
  stepDialogFormRef.value?.resetFields();
};

// 确认按钮（新增 Quality Inspection Process 记录）
const handleSave = async () => {
  // 表单验证
  if (!productionBatchFormRef.value) return;
  
  await productionBatchFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }

    const payload: QualityInspectionProcessForm = {
      productionBatchId: productionBatchForm.value.productionBatchId,
      // 当前登录用户作为检查员
      inspectorId: userStore.userId,
      // 系统当前时间（格式与其他质量检验页面一致）
      inspectionDate: parseTime(new Date(), '{y}-{m}-{d}') as string,
      status: '0',
      result: '2'
    };
    buttonLoading.value = true;
    try {
      await addQualityInspectionProcess(payload).finally(() => (buttonLoading.value = false));
      proxy?.$modal.msgSuccess('success');
      handleCancel();
    } catch (error) {
      console.error('Failed to save quality inspection process:', error);
    }
  });
};

// 取消按钮
const handleCancel = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

const isViewFlag = () => {
  return productionBatchForm.value.status === ProductionBatchStatus.Planned.toString();
};

/** 打开 IoT Dialog */
const openIotDialog = () => {
  resetIotDialog();
  iotDialog.visible = true;
  iotDialog.title = 'Add IOT Information';
  iotDialogForm.value.stepRunId = stepDialogForm.value.stepRunId;
};

/** IoT Dialog 确认 */
const handleIotDialogConfirm = () => {
  iotDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    iotButtonLoading.value = true;
    try {
      await addIotSensorReading(iotDialogForm.value);
      proxy.$modal.msgSuccess('IOT Information added successfully');
      iotDialog.visible = false;
      // 刷新 IoT 列表
      if (stepDialogForm.value.stepRunId) {
        await getIotSensorReadingList(stepDialogForm.value.stepRunId);
      }
      resetIotDialog();
    } catch (error) {
      console.error('Failed to add IOT information:', error);
    } finally {
      iotButtonLoading.value = false;
    }
  });
};

/** IoT Dialog 取消 */
const handleIotDialogCancel = () => {
  iotDialog.visible = false;
  resetIotDialog();
};

/** 重置 IoT Dialog 表单 */
const resetIotDialog = () => {
  iotDialogForm.value = { ...initialIotFormData };
  iotDialogFormRef.value?.resetFields();
};

/** 打开 Lab Test Dialog */
const openLabTestDialog = () => {
  resetLabTestDialog();
  labTestDialog.visible = true;
  labTestDialog.title = 'Add Lab Test';
  labTestDialogAction.value = 'add';
  // 如果只有一个 inspection，自动填充
  if (inspectionList.value.length === 1) {
    labTestDialogForm.value.inspectionId = inspectionList.value[0].inspectionId;
  }
};

/** 编辑 Lab Test */
const handleLabTestUpdate = (row: any) => {
  resetLabTestDialog();
  Object.assign(labTestDialogForm.value, row);
  labTestDialog.visible = true;
  labTestDialog.title = 'Edit Lab Test';
  labTestDialogAction.value = 'edit';
};

/** 删除 Lab Test */
const handleLabTestDelete = async (row: any) => {
  await proxy?.$modal.confirm('Are you sure delete this lab test?').finally(() => (labTestLoading.value = false));
  try {
    await delLabTest(row.labTestId);
    proxy?.$modal.msgSuccess('Lab Test deleted successfully');
    // 刷新 Lab Test 列表
    if (productionBatchForm.value.productionBatchId) {
      await getLabTestList(productionBatchForm.value.productionBatchId);
    }
  } catch (error) {
    console.error('Failed to delete lab test:', error);
  }
};

/** Lab Test Dialog 确认 */
const handleLabTestDialogConfirm = () => {
  labTestDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    labTestButtonLoading.value = true;
    try {
      if (labTestDialogAction.value === 'edit') {
        // 编辑模式
        await updateLabTest(labTestDialogForm.value);
        proxy.$modal.msgSuccess('Lab Test updated successfully');
      } else {
        // 新增模式
        await addLabTest(labTestDialogForm.value);
        proxy.$modal.msgSuccess('Lab Test added successfully');
      }
      labTestDialog.visible = false;
      // 刷新 Lab Test 列表
      if (productionBatchForm.value.productionBatchId) {
        await getLabTestList(productionBatchForm.value.productionBatchId);
      }
      resetLabTestDialog();
    } catch (error) {
      console.error('Failed to save lab test:', error);
    } finally {
      labTestButtonLoading.value = false;
    }
  });
};

/** Lab Test Dialog 取消 */
const handleLabTestDialogCancel = () => {
  labTestDialog.visible = false;
  resetLabTestDialog();
};

/** Lab Test 区域 Confirm / Cancel */
const handleLabTestConfirm = () => {
  proxy?.$modal.msgSuccess('Operation successful');
  handleCancel();
};

const handleLabTestCancel = () => {
  handleCancel();
};

/** 重置 Lab Test Dialog 表单 */
const resetLabTestDialog = () => {
  labTestDialogForm.value = { ...initialLabTestFormData };
  labTestDialogFormRef.value?.resetFields();
};
</script>
