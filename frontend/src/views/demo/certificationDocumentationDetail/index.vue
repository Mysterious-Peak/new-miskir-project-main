<template>
  <div class="p-2">
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Production Batch Information</span>
      </div>
      <el-form :model="productionBatchForm" label-width="240px" label-position="right" class="w-full">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Production Batch Id">
              <el-input v-model="productionBatchForm.productionBatchId" disabled />
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
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="100">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="View" placement="top" v-if="!isViewFlag()">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Quality Inspection -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Quality Inspection</span>
      </div>

      <!-- Quality Inspection Information -->
      <el-form :model="qualityInspectionForm" label-width="180px" class="mb-2">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="Inspection ID">
              <el-input v-model="qualityInspectionForm.inspectionId" placeholder="Please input" clearable :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Production Batch ID">
              <el-input v-model="qualityInspectionForm.productionBatchId" placeholder="Please input" clearable :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Inspector ID">
              <el-input v-model="qualityInspectionForm.inspectorId" placeholder="Please input" clearable :disabled="true" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="Inspection Date">
              <el-date-picker
                :disabled="true"
                v-model="qualityInspectionForm.inspectionDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Quality Score">
              <el-input-number
                v-model="qualityInspectionForm.qualityScore"
                placeholder="Please input"
                style="width: 100%"
                :precision="2"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Result">
              <el-select v-model="qualityInspectionForm.result" placeholder="Please select" style="width: 100%" clearable :disabled="true">
                <!-- 后端返回 0 / 1，这里用 0 / 1 作为 value，用文案作为 label，保证展示为 Pass / Fail -->
                <el-option label="Pass" value="0" />
                <el-option label="Fail" value="1" />
                <el-option label="Pending" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- Lab Test Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Lab Test Information</span>
      </div>

      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
        <!-- <el-button v-if="!isViewMode" type="primary" plain icon="Plus" @click="openLabTestDialog">Add</el-button> -->
      </div>
      <el-table v-loading="labTestLoading" :data="labTestList" stripe fit border>
        <el-table-column label="Lab Test ID" prop="labTestId" align="center" :min-width="getColumnWidth('Lab Test ID')" />
        <el-table-column label="Inspection ID" prop="inspectionId" align="center" :min-width="getColumnWidth('Inspection ID')" />
        <el-table-column label="Test Parameter" prop="testParameter" align="center" :min-width="getColumnWidth('Test Parameter')" />
        <el-table-column label="Test Value" prop="testValue" align="center" :min-width="getColumnWidth('Test Value')" />
        <el-table-column label="Standard Limit" prop="standardLimit" align="center" :min-width="getColumnWidth('Standard Limit')" />
        <el-table-column label="Result" prop="result" align="center" :min-width="getColumnWidth('Result')">
          <template #default="scope">
            <el-tag :type="scope.row.result === 'Pass' ? 'success' : 'danger'">{{ scope.row.result }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="View" placement="top">
              <el-button link type="primary" icon="View" @click="handleLabTestUpdate(scope.row)"></el-button>
            </el-tooltip>
            <!-- <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleLabTestDelete(scope.row)"></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Quality Certificate Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Quality Certificate Information</span>
      </div>

      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
        <el-button type="primary" plain icon="Plus" @click="openCertificateDialog">Add</el-button>
      </div>
      <el-table v-loading="qualityCertificateLoading" :data="qualityCertificateList" stripe fit border>
        <el-table-column label="Certificate ID" prop="certificateId" align="center" :min-width="getColumnWidth('Certificate ID')" />
        <el-table-column label="Production Batch ID" prop="productionBatchId" align="center" :min-width="getColumnWidth('Production Batch ID')" />
        <el-table-column label="Inspection ID" prop="inspectionId" align="center" :min-width="getColumnWidth('Inspection ID')" />
        <el-table-column label="Certificate Type" prop="certificateType" align="center" :min-width="getColumnWidth('Certificate Type')">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.certificateType === '0' || scope.row.certificateType === 0">ISO</el-tag>
            <el-tag type="warning" v-else-if="scope.row.certificateType === '1' || scope.row.certificateType === 1">Organic</el-tag>
            <el-tag type="info" v-else-if="scope.row.certificateType === '2' || scope.row.certificateType === 2">Export</el-tag>
            <span v-else>{{ scope.row.certificateType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Issuing Body" prop="issuingBody" align="center" :min-width="getColumnWidth('Issuing Body')" />
        <el-table-column label="Valid Until" prop="validUntil" align="center" width="160" :min-width="getColumnWidth('Valid Until')">
          <template #default="scope">
            <span v-if="scope.row.validUntil">{{ parseTime(scope.row.validUntil, '{y}-{m}-{d}') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Document URL" prop="documentUrl" align="center" :min-width="getColumnWidth('Document URL')">
          <template #default="scope">
            <el-link v-if="scope.row.documentUrl" :href="scope.row.documentUrl" type="primary" target="_blank">View</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleCertificateUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleCertificateDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="margin-top: 10px">
      <div class="dialog-footer" style="text-align: center">
        <!-- <el-button type="primary" @click="handleLabTestConfirm">Save</el-button> -->
        <el-button @click="handleLabTestCancel">Cancel</el-button>
      </div>
    </el-card>

    <!-- Action Buttons -->
    <!-- <el-card shadow="hover" class="mt-2 mb-2" :body-style="{ padding: '12px 24px' }" v-if="isViewFlag()">
      <div class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="handleSave">Confirm</el-button>
        <el-button @click="handleCancel">Cancel</el-button>
      </div>
    </el-card> -->

    <el-card v-show="dialog.visible" shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <template #header>
        <span>{{ dialog.title }}</span>
      </template>
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
      <div class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="handleStepDialogConfirm" v-if="isViewFlag() && dialogAction !== 'edit'">Save</el-button>
        <el-button @click="handleStepDialogCancel" v-if="isViewFlag() && dialogAction !== 'edit'">Cancel</el-button>
        <el-button @click="cancel" v-if="!isViewFlag() || dialogAction === 'edit'">Close</el-button>
      </div>
    </el-card>

    <!-- Add Lab Test Dialog -->
    <el-card v-show="labTestDialog.visible" shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <template #header>
        <span>{{ labTestDialog.title }}</span>
      </template>
      <el-form ref="labTestDialogFormRef" :model="labTestDialogForm" :rules="labTestDialogRules" label-width="auto">
        <el-form-item label="Lab Test ID" prop="labTestId" v-if="labTestDialogAction === 'edit'">
          <el-input v-model="labTestDialogForm.labTestId" placeholder="Lab Test ID" disabled />
        </el-form-item>
        <el-form-item label="Inspection ID" prop="inspectionId">
          <el-select v-model="labTestDialogForm.inspectionId" filterable clearable placeholder="Please select" style="width: 100%" :disabled="true">
            <el-option
              v-for="inspection in inspectionList"
              :key="inspection.inspectionId"
              :label="inspection.inspectionId"
              :value="inspection.inspectionId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Test Parameter" prop="testParameter">
          <el-input v-model="labTestDialogForm.testParameter" placeholder="Please input" clearable :disabled="true" />
        </el-form-item>
        <el-form-item label="Test Value" prop="testValue">
          <el-input-number v-model="labTestDialogForm.testValue" placeholder="Please input" style="width: 100%" :precision="2" :disabled="true" />
        </el-form-item>
        <el-form-item label="Standard Limit" prop="standardLimit">
          <el-input-number v-model="labTestDialogForm.standardLimit" placeholder="Please input" style="width: 100%" :precision="2" :disabled="true" />
        </el-form-item>
        <el-form-item label="Result" prop="result">
          <el-select v-model="labTestDialogForm.result" placeholder="Please select" style="width: 100%" :disabled="true">
            <el-option label="Pass" value="Pass" />
            <el-option label="Fail" value="Fail" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" style="text-align: center">
        <!-- <el-button type="primary" @click="handleLabTestDialogConfirm" :loading="labTestButtonLoading">Save</el-button> -->
        <el-button @click="handleLabTestDialogCancel">Cancel</el-button>
      </div>
    </el-card>

    <!-- Add Quality Certificate Dialog -->
    <el-card v-show="certificateDialog.visible" shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <template #header>
        <span>{{ certificateDialog.title }}</span>
      </template>
      <el-form ref="certificateDialogFormRef" :model="certificateDialogForm" :rules="certificateDialogRules" label-width="auto">
        <el-form-item label="Certificate ID" prop="certificateId" v-if="certificateDialogAction === 'edit'">
          <el-input v-model="certificateDialogForm.certificateId" placeholder="Certificate ID" disabled />
        </el-form-item>
        <el-form-item label="Production Batch ID" prop="productionBatchId">
          <el-input v-model="certificateDialogForm.productionBatchId" placeholder="Production Batch ID" disabled />
        </el-form-item>
        <el-form-item label="Certificate Type" prop="certificateType">
          <el-select v-model="certificateDialogForm.certificateType" placeholder="Please select" style="width: 100%" clearable>
            <el-option label="ISO" value="0" />
            <el-option label="Organic" value="1" />
            <el-option label="Export" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="Issuing Body" prop="issuingBody">
          <el-input v-model="certificateDialogForm.issuingBody" placeholder="Please input" clearable />
        </el-form-item>
        <el-form-item label="Valid Until" prop="validUntil">
          <el-date-picker
            v-model="certificateDialogForm.validUntil"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Please select"
            style="width: 100%"
            clearable
          />
        </el-form-item>
        <el-form-item label="Document URL" prop="documentUrl">
          <el-input v-model="certificateDialogForm.documentUrl" placeholder="Please input" clearable />
        </el-form-item>
      </el-form>
      <div class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="handleCertificateDialogConfirm" :loading="certificateButtonLoading">Save</el-button>
        <el-button @click="handleCertificateDialogCancel">Cancel</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ProcessingOperations" lang="ts">
import { addIotSensorReading, listIotSensorReading } from '@/api/demo/iotSensorReading';
import { addProcessStepRuns, delProcessStepRuns, listProcessStepRuns, updateProcessStepRuns } from '@/api/demo/processStepRuns';
import { getProductionBatch, updateProductionBatchWithSteps } from '@/api/demo/productionBatch';
import type { ProductionBatchForm } from '@/api/demo/productionBatch/types';
import type { QualityInspectionProcessForm } from '@/api/demo/qualityInspectionProcess/types';
import { addLabTest, listLabTest, updateLabTest, delLabTest } from '@/api/demo/labTest';
import { listQualityInspectionProcess, updateQualityInspectionProcess } from '@/api/demo/qualityInspectionProcess';
import { ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';
import { InfoFilled } from '@element-plus/icons-vue';
import type { QualityCertificateForm } from '@/api/demo/qualityCertificate/types';
import { addQualityCertificate, delQualityCertificate, listQualityCertificate, updateQualityCertificate } from '@/api/demo/qualityCertificate';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const buttonLoading = ref(false);
const loading = ref(true);

const initialStepFormData = {
  stepRunId: undefined,
  productionBatchId: undefined,
  stepName: undefined,
  startTime: undefined,
  endTime: undefined,
  operatorId: undefined
};

// Production Batch Information
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
  result: undefined
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

// 是否为查看模式（从列表 handleView 进入）
const isViewMode = computed(() => proxy.$route.query.mode === 'view');

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

/**
 * 根据当前路由参数加载页面数据
 * - productionBatchId：用于加载生产批次和工序信息
 * - inspectionId：用于在多个质检记录中定位当前这一条
 */
const loadPageData = async () => {
  const productionBatchId = proxy.$route.query.productionBatchId as string;
  const inspectionId = proxy.$route.query.inspectionId as string | undefined;
  if (!productionBatchId) return;

  const { data: productionBatchInfo } = await getProductionBatch(productionBatchId);
  productionBatchForm.value = productionBatchInfo;

  await getProcessStepRunList(productionBatchId);
  await getLabTestList(productionBatchId, inspectionId);
  await getQualityCertificateList(inspectionId);
};

onMounted(async () => {
  nextTick(async () => {
    await loadPageData();
  });
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
const getLabTestList = async (productionBatchId?: string | number, inspectionId?: string) => {
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

    // 根据路由或传入的 inspectionId 精确定位当前质检记录
    let targetInspection: any | undefined;
    const targetInspectionId = inspectionId || (proxy.$route.query.inspectionId as string | undefined);

    if (targetInspectionId) {
      targetInspection = inspections.find((item: any) => item.inspectionId === targetInspectionId);
    }
    // 如果没有找到匹配项，则回退到第一条记录
    if (!targetInspection && inspections.length > 0) {
      targetInspection = inspections[0] as any;
    }

    // 填充质量检查表单，并按当前 inspectionId 获取对应的 Lab Test 数据
    if (targetInspection) {
      qualityInspectionForm.value = {
        inspectionId: targetInspection.inspectionId,
        productionBatchId: targetInspection.productionBatchId,
        inspectorId: targetInspection.inspectorId,
        inspectionDate: targetInspection.inspectionDate,
        qualityScore: targetInspection.qualityScore,
        status: targetInspection.status,
        // 如果后端暂时只有 status 字段，这里用 status 作为 result 的兜底
        result: targetInspection.result ?? targetInspection.status
      };

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
  } catch (error) {
    console.error('Failed to load lab tests:', error);
    labTestList.value = [];
  } finally {
    labTestLoading.value = false;
  }
};

// 监听路由参数变化（尤其是 inspectionId），确保从列表页点不同记录时详情数据会刷新
watch(
  () => [proxy.$route.query.productionBatchId, proxy.$route.query.inspectionId],
  () => {
    nextTick(async () => {
      await loadPageData();
    });
  }
);

/** 表单重置 */
const reset = () => {
  stepDialogForm.value = { ...initialStepFormData };
  iotSensorReadingList.value = [];
  stepDialogFormRef.value?.resetFields();
};

// 确认按钮
const handleSave = async () => {
  if (!processStepRunList.value || processStepRunList.value.length === 0) {
    proxy?.$modal.msgError('Please add at least one process step before confirming');
    return;
  }
  buttonLoading.value = true;
  try {
    const steps = (processStepRunList.value || []).map((step) => {
      const stepData = { ...step };
      return stepData;
    });

    await updateProductionBatchWithSteps({
      productionBatch: productionBatchForm.value,
      processSteps: steps
    });
    proxy?.$modal.msgSuccess('success');
    handleCancel();
  } finally {
    buttonLoading.value = false;
  }
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
  // 优先使用上方 Quality Inspection 区域当前的 Inspection ID
  if (qualityInspectionForm.value.inspectionId) {
    labTestDialogForm.value.inspectionId = qualityInspectionForm.value.inspectionId;
  } else if (inspectionList.value.length === 1) {
    // 否则如果只有一个 inspection，自动填充该 inspectionId
    labTestDialogForm.value.inspectionId = inspectionList.value[0].inspectionId;
  }
};

/** 编辑 Lab Test */
const handleLabTestUpdate = (row: any) => {
  resetLabTestDialog();
  Object.assign(labTestDialogForm.value, row);
  labTestDialog.visible = true;
  labTestDialog.title = 'View Lab Test';
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

/** Lab Test 区域 Save：只保存当前 Quality Inspection 信息，不改变状态 */
const handleLabTestConfirm = async () => {
  if (!qualityInspectionForm.value.inspectionId) {
    proxy?.$modal.msgError('Inspection ID cannot be empty');
    return;
  }

  try {
    const mergedResult = qualityInspectionForm.value.result;

    const payload: QualityInspectionProcessForm = {
      inspectionId: qualityInspectionForm.value.inspectionId,
      productionBatchId: qualityInspectionForm.value.productionBatchId,
      inspectorId: qualityInspectionForm.value.inspectorId,
      inspectionDate: qualityInspectionForm.value.inspectionDate,
      qualityScore: qualityInspectionForm.value.qualityScore,
      // 后端目前用 status / result 表示质检结果，这里统一用 mergedResult 同时赋值给 status 和 result
      status: qualityInspectionForm.value.status,
      result: mergedResult
    };

    await updateQualityInspectionProcess(payload);
    proxy?.$modal.msgSuccess('Quality Inspection saved successfully');

    // 保存成功后，刷新当前 Inspection / Lab Test 数据，保持界面和后台一致
    if (productionBatchForm.value.productionBatchId) {
      await getLabTestList(productionBatchForm.value.productionBatchId as string | number, payload.inspectionId as string);
    }
  } catch (error) {
    console.error('Failed to save quality inspection:', error);
  }
};

/** Lab Test 区域 Approval：审批通过，将状态置为 1 并保存 */
const handleLabTestApproval = async () => {
  if (!qualityInspectionForm.value.inspectionId) {
    proxy?.$modal.msgError('Inspection ID cannot be empty');
    return;
  }

  try {
    const mergedResult = qualityInspectionForm.value.result;

    const payload: QualityInspectionProcessForm = {
      inspectionId: qualityInspectionForm.value.inspectionId,
      productionBatchId: qualityInspectionForm.value.productionBatchId,
      inspectorId: qualityInspectionForm.value.inspectorId,
      inspectionDate: qualityInspectionForm.value.inspectionDate,
      qualityScore: qualityInspectionForm.value.qualityScore,
      // 审批通过：状态固定为 '1'
      status: '1',
      result: mergedResult
    };

    await updateQualityInspectionProcess(payload);
    // 本地同步状态，避免界面和后台不一致
    qualityInspectionForm.value.status = '1';
    proxy?.$modal.msgSuccess('Quality Inspection approved successfully');

    if (productionBatchForm.value.productionBatchId) {
      await getLabTestList(productionBatchForm.value.productionBatchId as string | number, payload.inspectionId as string);
    }
  } catch (error) {
    console.error('Failed to approve quality inspection:', error);
  }
};

const handleLabTestCancel = () => {
  handleCancel();
};

/** 重置 Lab Test Dialog 表单 */
const resetLabTestDialog = () => {
  labTestDialogForm.value = { ...initialLabTestFormData };
  labTestDialogFormRef.value?.resetFields();
};

/**************************************************/
const certificateDialog = reactive<DialogOption>({
  visible: false,
  title: 'Add Quality Certificate'
});
const certificateDialogAction = ref<'add' | 'edit'>('add');
const certificateDialogFormRef = ref<ElFormInstance>();
const qualityCertificateList = ref<any[]>([]);
const qualityCertificateLoading = ref(false);
const showCertificateSearch = ref(true);
const certificateButtonLoading = ref(false);

const certificateDialogRules = {
  certificateType: [{ required: true, message: 'Certificate Type cannot be empty', trigger: 'change' }],
  issuingBody: [{ required: true, message: 'Issuing Body cannot be empty', trigger: 'blur' }],
  validUntil: [{ required: true, message: 'Valid Until cannot be empty', trigger: 'change' }]
};

const initialCertificateFormData: QualityCertificateForm = {
  certificateId: undefined,
  inspectionId: undefined,
  productionBatchId: undefined,
  certificateType: undefined,
  issuingBody: undefined,
  validUntil: undefined,
  documentUrl: undefined
};
const certificateDialogForm = ref<QualityCertificateForm>({ ...initialCertificateFormData });
const openCertificateDialog = () => {
  resetCertificateDialog();
  certificateDialog.visible = true;
  certificateDialog.title = 'Add Quality Certificate';
  certificateDialogAction.value = 'add';
  certificateDialogForm.value.productionBatchId = productionBatchForm.value.productionBatchId;
  certificateDialogForm.value.inspectionId = qualityInspectionForm.value.inspectionId;
};
const resetCertificateDialog = () => {
  certificateDialogForm.value = { ...initialCertificateFormData };
  certificateDialogFormRef.value?.resetFields();
};
const getQualityCertificateList = async (inspectionId?: string | number) => {
  const _inspectionId = inspectionId || qualityInspectionForm.value.inspectionId;
  if (!_inspectionId) return;

  qualityCertificateLoading.value = true;
  try {
    const res: any = await listQualityCertificate({
      inspectionId: _inspectionId,
      pageNum: 1,
      pageSize: 1000
    });
    const rows = res?.rows ?? res;
    qualityCertificateList.value = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Failed to load quality certificates:', error);
    qualityCertificateList.value = [];
  } finally {
    qualityCertificateLoading.value = false;
  }
};
const handleCertificateUpdate = (row: any) => {
  resetCertificateDialog();
  Object.assign(certificateDialogForm.value, row);
  // 确保 certificateType 是字符串格式 '0', '1', '2'
  if (certificateDialogForm.value.certificateType !== undefined) {
    certificateDialogForm.value.certificateType = String(certificateDialogForm.value.certificateType);
  }
  certificateDialog.visible = true;
  certificateDialog.title = 'Edit Quality Certificate';
  certificateDialogAction.value = 'edit';
};

const handleCertificateDelete = async (row: any) => {
  await proxy?.$modal.confirm('Are you sure delete this quality certificate?').finally(() => (qualityCertificateLoading.value = false));
  try {
    await delQualityCertificate(row.certificateId);
    proxy?.$modal.msgSuccess('Quality Certificate deleted successfully');
    if (qualityInspectionForm.value.inspectionId) {
      await getQualityCertificateList(qualityInspectionForm.value.inspectionId);
    }
  } catch (error) {
    console.error('Failed to delete quality certificate:', error);
  }
};

/** Certificate Dialog 确认 */
const handleCertificateDialogConfirm = () => {
  certificateDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    certificateButtonLoading.value = true;
    try {
      if (certificateDialogAction.value === 'edit') {
        // 编辑模式
        await updateQualityCertificate(certificateDialogForm.value);
        proxy.$modal.msgSuccess('Quality Certificate updated successfully');
      } else {
        // 新增模式
        await addQualityCertificate(certificateDialogForm.value);
        proxy.$modal.msgSuccess('Quality Certificate added successfully');
      }
      certificateDialog.visible = false;
      // 刷新 Quality Certificate 列表
      if (qualityInspectionForm.value.inspectionId) {
        await getQualityCertificateList(qualityInspectionForm.value.inspectionId);
      }
      resetCertificateDialog();
    } catch (error) {
      console.error('Failed to save quality certificate:', error);
    } finally {
      certificateButtonLoading.value = false;
    }
  });
};

/** Certificate Dialog 取消 */
const handleCertificateDialogCancel = () => {
  certificateDialog.visible = false;
  resetCertificateDialog();
};
</script>
