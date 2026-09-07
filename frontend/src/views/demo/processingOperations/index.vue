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
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Process Steps Information</span>
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
        <el-table-column label="Operator User Name" align="center" prop="operatorUserName" :min-width="getColumnWidth('Operator User Name')" />
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

      <div v-show="dialog.visible" class="inline-form-panel">
        <div class="inline-form-panel__header">
          <span>{{ dialog.title }}</span>
        </div>
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
          <el-form-item label="Operator User Name" prop="operatorUserName">
            <el-input
              v-model="stepDialogForm.operatorUserName"
              placeholder="Please input"
              :disabled="dialogAction === 'edit' || !isViewFlag()"
              clearable
            />
          </el-form-item>
          <el-form-item label-width="0" v-if="isViewFlag()">
            <el-button type="primary" plain icon="Plus" @click="openIotDialog" style="width: fit-content !important">Add IOT Information</el-button>
          </el-form-item>
          <el-table :data="iotSensorReadingList" stripe fit border style="width: 100%">
            <el-table-column label="Sensor Reading ID" prop="sensorReadingId" align="center" :min-width="getColumnWidth('Sensor Reading ID')" />
            <el-table-column label="Sensor Type" prop="sensorType" align="center" :min-width="getColumnWidth('Sensor Type')">
              <template #default="scope">
                <dict-tag :options="sensor_type" :value="scope.row.sensorType" />
              </template>
            </el-table-column>
            <el-table-column label="Reading Value" prop="readingValue" align="center" :min-width="getColumnWidth('Reading Value')" />
            <el-table-column label="Reading Time" prop="readingTime" align="center" width="180" :min-width="getColumnWidth('Reading Time')">
              <template #default="scope">
                <span>{{ parseTime(scope.row.readingTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="110px">
              <template #default="scope">
                <el-tooltip content="Edit" placement="top" v-if="isViewFlag()">
                  <el-button link type="primary" icon="Edit" @click="handleEditIot(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip content="Delete" placement="top" v-if="isViewFlag()">
                  <el-button link type="primary" icon="Delete" @click="handleDeleteIot(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip content="View" placement="top" v-if="!isViewFlag()">
                  <el-button link type="primary" icon="View" @click="handleViewIot(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <div class="inline-form-panel__footer">
          <div class="dialog-footer">
            <el-button type="primary" @click="handleStepDialogConfirm" v-if="isViewFlag() && dialogAction !== 'edit'">Save</el-button>
            <el-button @click="handleStepDialogCancel" v-if="isViewFlag() && dialogAction !== 'edit'">Cancel</el-button>
            <el-button @click="cancel" v-if="!isViewFlag() || dialogAction === 'edit'">Close</el-button>
          </div>
        </div>
      </div>

      <!-- Add IOT Information Dialog -->
      <div v-show="iotDialog.visible" class="inline-form-panel">
        <div class="inline-form-panel__header">
          <span>{{ iotDialog.title }}</span>
        </div>
        <el-form ref="iotDialogFormRef" :model="iotDialogForm" :rules="iotDialogRules" label-width="auto">
          <el-form-item label="Sensor Reading ID" prop="sensorReadingId" v-if="iotDialogAction === 'edit' || iotDialogAction === 'view'">
            <el-input v-model="iotDialogForm.sensorReadingId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Sensor Type" prop="sensorType">
            <el-select v-model="iotDialogForm.sensorType" placeholder="Please select" :disabled="iotDialogAction === 'view'" clearable>
              <el-option v-for="item in sensor_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Reading Value" prop="readingValue">
            <el-input-number
              v-model="iotDialogForm.readingValue"
              placeholder="Please input"
              style="width: 220px"
              :disabled="iotDialogAction === 'view'"
            />
          </el-form-item>
          <el-form-item label="Reading Time" prop="readingTime">
            <el-date-picker
              clearable
              v-model="iotDialogForm.readingTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="Please select"
              :disabled="iotDialogAction === 'view'"
            >
            </el-date-picker>
          </el-form-item>
        </el-form>
        <div class="inline-form-panel__footer">
          <div class="dialog-footer">
            <el-button
              type="primary"
              @click="handleIotDialogConfirm"
              :loading="iotButtonLoading"
              v-if="(iotDialogAction === 'add' || iotDialogAction === 'edit') && isViewFlag()"
              >Save</el-button
            >
            <el-button @click="handleIotDialogCancel" v-if="(iotDialogAction === 'add' || iotDialogAction === 'edit') && isViewFlag()"
              >Cancel</el-button
            >
            <el-button @click="handleIotDialogCancel" v-if="iotDialogAction === 'view' || !isViewFlag()">Close</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Batch Input Link Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Batch Input Link Information</span>
      </div>
      <el-form label-width="0" class="mb-2">
        <el-form-item label-width="0" v-if="isViewFlag()">
          <el-button type="primary" plain icon="Plus" @click="openBatchInputLinkDialog" style="width: fit-content !important"
            >Add Batch Input Link</el-button
          >
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="batchInputLinkList" stripe fit border>
        <el-table-column label="Batch Input Link ID" prop="batchInputLinkId" align="center" :min-width="getColumnWidth('Batch Input Link ID')" />
        <el-table-column label="Production Batch ID" prop="productionBatchId" align="center" :min-width="getColumnWidth('Production Batch ID')" />
        <el-table-column label="Intake ID" prop="intakeId" align="center" :min-width="getColumnWidth('Intake ID')" />
        <el-table-column label="Quantity Used" prop="quantityUsed" align="center" :min-width="getColumnWidth('Quantity Used')" />
        <el-table-column label="Unit" prop="unit" align="center" :min-width="getColumnWidth('Unit')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="110px">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Edit" @click="handleEditBatchInputLink(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Delete" @click="handleDeleteBatchInputLink(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="View" placement="top" v-if="!isViewFlag()">
              <el-button link type="primary" icon="View" @click="handleViewBatchInputLink(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="batchInputLinkDialog.visible" class="inline-form-panel">
        <div class="inline-form-panel__header">
          <span>{{ batchInputLinkDialog.title }}</span>
        </div>
        <el-form ref="batchInputLinkDialogFormRef" :model="batchInputLinkDialogForm" :rules="batchInputLinkDialogRules" label-width="auto">
          <el-form-item
            label="Batch Input Link ID"
            prop="batchInputLinkId"
            v-if="batchInputLinkDialogAction === 'edit' || batchInputLinkDialogAction === 'view'"
          >
            <el-input v-model="batchInputLinkDialogForm.batchInputLinkId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item
            label="Production Batch ID"
            prop="productionBatchId"
            v-if="batchInputLinkDialogAction === 'edit' || batchInputLinkDialogAction === 'view'"
          >
            <el-input v-model="batchInputLinkDialogForm.productionBatchId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Intake ID" prop="intakeId">
            <el-select
              v-model="batchInputLinkDialogForm.intakeId"
              filterable
              remote
              reserve-keyword
              placeholder="Please input"
              :remote-method="intakeIdRemoteMethod"
              :loading="intakeIdLoading"
              :debounce="300"
              clearable
              :disabled="batchInputLinkDialogAction === 'view'"
            >
              <el-option v-for="item in intakeIdOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Quantity Used" prop="quantityUsed">
            <el-input-number
              v-model="batchInputLinkDialogForm.quantityUsed"
              placeholder="Please input"
              style="width: 220px"
              :disabled="batchInputLinkDialogAction === 'view'"
            />
          </el-form-item>
          <el-form-item label="Unit" prop="unit">
            <el-input v-model="batchInputLinkDialogForm.unit" placeholder="Please input" clearable :disabled="batchInputLinkDialogAction === 'view'" />
          </el-form-item>
        </el-form>
        <div class="inline-form-panel__footer">
          <div class="dialog-footer">
            <el-button
              type="primary"
              @click="handleBatchInputLinkDialogConfirm"
              :loading="batchInputLinkButtonLoading"
              v-if="batchInputLinkDialogAction !== 'view' && isViewFlag()"
              >Save</el-button
            >
            <el-button @click="handleBatchInputLinkDialogCancel" v-if="batchInputLinkDialogAction !== 'view' && isViewFlag()">Cancel</el-button>
            <el-button @click="handleBatchInputLinkDialogCancel" v-if="batchInputLinkDialogAction === 'view' || !isViewFlag()">Close</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Waste Product Record Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Waste Product Record Information</span>
      </div>
      <el-form label-width="0" class="mb-2">
        <el-form-item label-width="0" v-if="isViewFlag()">
          <el-button type="primary" plain icon="Plus" @click="openWasteByproductDialog" style="width: fit-content !important"
            >Add Waste Product Record</el-button
          >
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="wasteByproductList" stripe fit border>
        <el-table-column label="Record ID" prop="wasteRecordId" align="center" :min-width="getColumnWidth('Record ID')" />
        <el-table-column label="Production Batch ID" prop="productionBatchId" align="center" :min-width="getColumnWidth('Production Batch ID')" />
        <el-table-column label="Waste Type" prop="wasteType" align="center" :min-width="getColumnWidth('Waste Type')" />
        <el-table-column label="Quantity" prop="quantity" align="center" :min-width="getColumnWidth('Quantity')" />
        <el-table-column label="Reuse Potential" prop="reusePotential" align="center" :min-width="getColumnWidth('Reuse Potential')">
          <template #default="scope">
            <dict-tag :options="reuse_potsential" :value="scope.row.reusePotential" />
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="110px">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Edit" @click="handleEditWasteByproduct(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Delete" @click="handleDeleteWasteByproduct(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="View" placement="top" v-if="!isViewFlag()">
              <el-button link type="primary" icon="View" @click="handleViewWasteByproduct(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="wasteByproductDialog.visible" class="inline-form-panel">
        <div class="inline-form-panel__header">
          <span>{{ wasteByproductDialog.title }}</span>
        </div>
        <el-form ref="wasteByproductDialogFormRef" :model="wasteByproductDialogForm" :rules="wasteByproductDialogRules" label-width="auto">
          <el-form-item label="Record ID" prop="wasteRecordId" v-if="wasteByproductDialogAction === 'edit' || wasteByproductDialogAction === 'view'">
            <el-input v-model="wasteByproductDialogForm.wasteRecordId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item
            label="Production Batch ID"
            prop="productionBatchId"
            v-if="wasteByproductDialogAction === 'edit' || wasteByproductDialogAction === 'view'"
          >
            <el-input v-model="wasteByproductDialogForm.productionBatchId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Waste Type" prop="wasteType">
            <el-input
              v-model="wasteByproductDialogForm.wasteType"
              placeholder="Please input"
              clearable
              :disabled="wasteByproductDialogAction === 'view'"
            />
          </el-form-item>
          <el-form-item label="Quantity" prop="quantity">
            <el-input-number
              v-model="wasteByproductDialogForm.quantity"
              placeholder="Please input"
              style="width: 220px"
              :disabled="wasteByproductDialogAction === 'view'"
            />
          </el-form-item>
          <el-form-item label="Reuse Potential" prop="reusePotential">
            <el-select
              v-model="wasteByproductDialogForm.reusePotential"
              placeholder="Please select"
              :disabled="wasteByproductDialogAction === 'view'"
              clearable
            >
              <el-option v-for="item in reuse_potsential" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="inline-form-panel__footer">
          <div class="dialog-footer">
            <el-button
              type="primary"
              @click="handleWasteByproductDialogConfirm"
              :loading="wasteByproductButtonLoading"
              v-if="wasteByproductDialogAction !== 'view' && isViewFlag()"
              >Save</el-button
            >
            <el-button @click="handleWasteByproductDialogCancel" v-if="wasteByproductDialogAction !== 'view' && isViewFlag()">Cancel</el-button>
            <el-button @click="handleWasteByproductDialogCancel" v-if="wasteByproductDialogAction === 'view' || !isViewFlag()">Close</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Resource Use Record Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Resource Use Record Information</span>
      </div>
      <el-form label-width="0" class="mb-2">
        <el-form-item label-width="0" v-if="isViewFlag()">
          <el-button type="primary" plain icon="Plus" @click="openResourceUseRecordDialog" style="width: fit-content !important"
            >Add Resource Use Record</el-button
          >
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="resourceUseRecordList" stripe fit border>
        <el-table-column label="Record ID" prop="resourceRecordId" align="center" :min-width="getColumnWidth('Record ID')" />
        <el-table-column label="Production Batch ID" prop="productionBatchId" align="center" :min-width="getColumnWidth('Production Batch ID')" />
        <el-table-column label="Resource Type" prop="resourceType" align="center" :min-width="getColumnWidth('Resource Type')">
          <template #default="scope">
            <dict-tag :options="resource_type" :value="scope.row.resourceType" />
          </template>
        </el-table-column>
        <el-table-column label="Quantity Used" prop="quantityUsed" align="center" :min-width="getColumnWidth('Quantity Used')" />
        <el-table-column label="Measurement Time" prop="measurementTime" align="center" width="180" :min-width="getColumnWidth('Measurement Time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.measurementTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="110px">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Edit" @click="handleEditResourceUseRecord(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Delete" @click="handleDeleteResourceUseRecord(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="View" placement="top" v-if="!isViewFlag()">
              <el-button link type="primary" icon="View" @click="handleViewResourceUseRecord(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="resourceUseRecordDialog.visible" class="inline-form-panel">
        <div class="inline-form-panel__header">
          <span>{{ resourceUseRecordDialog.title }}</span>
        </div>
        <el-form ref="resourceUseRecordDialogFormRef" :model="resourceUseRecordDialogForm" :rules="resourceUseRecordDialogRules" label-width="auto">
          <el-form-item
            label="Record ID"
            prop="resourceRecordId"
            v-if="resourceUseRecordDialogAction === 'edit' || resourceUseRecordDialogAction === 'view'"
          >
            <el-input v-model="resourceUseRecordDialogForm.resourceRecordId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item
            label="Production Batch ID"
            prop="productionBatchId"
            v-if="resourceUseRecordDialogAction === 'edit' || resourceUseRecordDialogAction === 'view'"
          >
            <el-input v-model="resourceUseRecordDialogForm.productionBatchId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Resource Type" prop="resourceType">
            <el-select
              v-model="resourceUseRecordDialogForm.resourceType"
              placeholder="Please select"
              :disabled="resourceUseRecordDialogAction === 'view'"
              clearable
            >
              <el-option v-for="item in resource_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Quantity Used" prop="quantityUsed">
            <el-input-number
              v-model="resourceUseRecordDialogForm.quantityUsed"
              placeholder="Please input"
              style="width: 220px"
              :disabled="resourceUseRecordDialogAction === 'view'"
            />
          </el-form-item>
          <el-form-item label="Measurement Time" prop="measurementTime">
            <el-date-picker
              v-model="resourceUseRecordDialogForm.measurementTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="Please select"
              :disabled="resourceUseRecordDialogAction === 'view'"
            >
            </el-date-picker>
          </el-form-item>
        </el-form>
        <div class="inline-form-panel__footer">
          <div class="dialog-footer">
            <el-button
              type="primary"
              @click="handleResourceUseRecordDialogConfirm"
              :loading="resourceUseRecordButtonLoading"
              v-if="resourceUseRecordDialogAction !== 'view' && isViewFlag()"
              >Save</el-button
            >
            <el-button @click="handleResourceUseRecordDialogCancel" v-if="resourceUseRecordDialogAction !== 'view' && isViewFlag()">Cancel</el-button>
            <el-button @click="handleResourceUseRecordDialogCancel" v-if="resourceUseRecordDialogAction === 'view' || !isViewFlag()">Close</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Quality Inspection Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Quality Inspection Information</span>
      </div>
      <el-table v-loading="loading" :data="qualityInspectionList" stripe fit border>
        <el-table-column label="Inspection ID" prop="inspectionId" align="center" :min-width="getColumnWidth('Inspection ID')" />
        <el-table-column label="Production Batch ID" prop="productionBatchId" align="center" :min-width="getColumnWidth('Production Batch ID')" />
        <el-table-column label="Inspector User Name" prop="inspectorUserName" align="center" :min-width="getColumnWidth('Inspector User Name')" />
        <el-table-column label="Inspection Date" prop="inspectionDate" align="center" width="180" :min-width="getColumnWidth('Inspection Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Quality Score" prop="qualityScore" align="center" :min-width="getColumnWidth('Quality Score')" />
        <el-table-column label="Result" prop="result" align="center" :min-width="getColumnWidth('Result')">
          <template #default="scope">
            <dict-tag :options="quality_inspection_result" :value="scope.row.result" />
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="110px">
          <template #default="scope">
            <el-tooltip content="View" placement="top">
              <el-button link type="primary" icon="View" @click="handleViewQualityInspection(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="qualityInspectionDialog.visible" class="inline-form-panel">
        <div class="inline-form-panel__header">
          <span>{{ qualityInspectionDialog.title }}</span>
        </div>
        <el-form ref="qualityInspectionDialogFormRef" :model="qualityInspectionDialogForm" label-width="auto">
          <el-form-item label="Inspection ID" prop="inspectionId">
            <el-input v-model="qualityInspectionDialogForm.inspectionId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Production Batch ID" prop="productionBatchId">
            <el-input v-model="qualityInspectionDialogForm.productionBatchId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Inspector User Name" prop="inspectorUserName">
            <el-input v-model="qualityInspectionDialogForm.inspectorUserName" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Inspection Date" prop="inspectionDate">
            <el-date-picker
              v-model="qualityInspectionDialogForm.inspectionDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select"
              disabled
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Quality Score" prop="qualityScore">
            <el-input-number v-model="qualityInspectionDialogForm.qualityScore" placeholder="Please input" style="width: 220px" disabled />
          </el-form-item>
          <el-form-item label="Result" prop="result">
            <el-select v-model="qualityInspectionDialogForm.result" placeholder="Please select" disabled>
              <el-option v-for="item in quality_inspection_result" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>

        <el-table :data="labTestList" stripe fit border>
          <el-table-column label="Lab Test ID" prop="labTestId" align="center" :min-width="getColumnWidth('Lab Test ID')" />
          <el-table-column label="Test Parameter" prop="testParameter" align="center" :min-width="getColumnWidth('Test Parameter')" />
          <el-table-column label="Test Value" prop="testValue" align="center" :min-width="getColumnWidth('Test Value')" />
          <el-table-column label="Standard Limit" prop="standardLimit" align="center" :min-width="getColumnWidth('Standard Limit')" />
          <el-table-column label="Result" prop="result" align="center" :min-width="getColumnWidth('Result')">
            <template #default="scope">
              <dict-tag :options="quality_inspection_result" :value="scope.row.result" />
            </template>
          </el-table-column>
        </el-table>
        <div class="inline-form-panel__footer">
          <div class="dialog-footer">
            <el-button @click="handleQualityInspectionDialogCancel">Close</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Quality Certificate Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Quality Certificate Information</span>
      </div>
      <el-table v-loading="loading" :data="qualityCertificateList" stripe fit border>
        <el-table-column label="Certificate ID" prop="certificateId" align="center" :min-width="getColumnWidth('Certificate ID')" />
        <el-table-column label="Production Batch ID" prop="productionBatchId" align="center" :min-width="getColumnWidth('Production Batch ID')" />
        <el-table-column label="Certificate Type" prop="certificateType" align="center" :min-width="getColumnWidth('Certificate Type')">
          <template #default="scope">
            <dict-tag :value="scope.row.certificateType" :options="certificate_type" />
          </template>
        </el-table-column>
        <el-table-column label="Issuing Body" prop="issuingBody" align="center" :min-width="getColumnWidth('Issuing Body')" />
        <el-table-column label="Valid Until" prop="validUntil" align="center" width="180" :min-width="getColumnWidth('Valid Until')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.validUntil, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Document URL" prop="documentUrl" align="center" :min-width="getColumnWidth('Document URL')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="110px">
          <template #default="scope">
            <el-tooltip content="View" placement="top">
              <el-button link type="primary" icon="View" @click="handleViewQualityCertificate(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="qualityCertificateDialog.visible" class="inline-form-panel">
        <div class="inline-form-panel__header">
          <span>{{ qualityCertificateDialog.title }}</span>
        </div>
        <el-form ref="qualityCertificateDialogFormRef" :model="qualityCertificateDialogForm" label-width="auto">
          <el-form-item label="Certificate ID" prop="certificateId">
            <el-input v-model="qualityCertificateDialogForm.certificateId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Production Batch ID" prop="productionBatchId">
            <el-input v-model="qualityCertificateDialogForm.productionBatchId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Certificate Type" prop="certificateType">
            <el-select v-model="qualityCertificateDialogForm.certificateType" placeholder="Please select" disabled>
              <el-option v-for="item in certificate_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Issuing Body" prop="issuingBody">
            <el-input v-model="qualityCertificateDialogForm.issuingBody" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Valid Until" prop="validUntil">
            <el-date-picker
              v-model="qualityCertificateDialogForm.validUntil"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select"
              disabled
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Document URL" prop="documentUrl">
            <el-input v-model="qualityCertificateDialogForm.documentUrl" placeholder="Please input" disabled />
          </el-form-item>
        </el-form>
        <div class="inline-form-panel__footer">
          <div class="dialog-footer">
            <el-button @click="handleQualityCertificateDialogCancel">Close</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Action Buttons -->
    <el-card
      shadow="hover"
      class="mt-2 mb-2"
      :body-style="{ padding: '12px 24px' }"
      v-if="
        productionBatchForm.status === ProductionBatchStatus.Planned.toString() ||
        productionBatchForm.status === ProductionBatchStatus.Running.toString()
      "
    >
      <div class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="handleSave" v-if="productionBatchForm.status === ProductionBatchStatus.Planned.toString()"
          >Begin Operation</el-button
        >
        <el-button type="primary" @click="handleComplete" v-if="productionBatchForm.status === ProductionBatchStatus.Running.toString()"
          >Complete</el-button
        >
        <el-button @click="handleCancel">Cancel</el-button>
      </div>
    </el-card>

    <!-- Add IOT Information Dialog -->
    <!-- Add Batch Input Link Dialog -->
    <!-- View Quality Certificate Dialog -->
    <!-- View Quality Inspection Dialog -->
    <!-- Add Waste Product Record Dialog -->
    <!-- Add Resource Use Record Dialog -->
  </div>
</template>

<script setup name="ProcessingOperations" lang="ts">
import { addBatchInput, delBatchInput, getBatchInput, listBatchInput, updateBatchInput } from '@/api/demo/batchInput';
import { listRawMaterialIntake } from '@/api/demo/rawMaterialIntake';
import {
  addWasteByproductRecord,
  delWasteByproductRecord,
  getWasteByproductRecord,
  listWasteByproductRecord,
  updateWasteByproductRecord
} from '@/api/demo/wasteByproductRecord';
import {
  addResourceUseRecord,
  delResourceUseRecord,
  getResourceUseRecord,
  listResourceUseRecord,
  updateResourceUseRecord
} from '@/api/demo/resourceUseRecord';
import { listLabTest } from '@/api/demo/labTest';
import { getQualityInspectionProcess, listQualityInspectionProcess } from '@/api/demo/qualityInspectionProcess';
import { getQualityCertificate, listQualityCertificate } from '@/api/demo/qualityCertificate';
import {
  addIotSensorReading,
  delIotSensorReading,
  getIotSensorReading,
  listIotSensorReading,
  updateIotSensorReading
} from '@/api/demo/iotSensorReading';
import { addProcessStepRuns, delProcessStepRuns, getProcessStepRuns, listProcessStepRuns, updateProcessStepRuns } from '@/api/demo/processStepRuns';
import { getProductionBatch, updateProductionBatch } from '@/api/demo/productionBatch';
import type { ProductionBatchForm } from '@/api/demo/productionBatch/types';
import { BusinessType, PlanningAndProtocolTaskName, ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';
import { InfoFilled } from '@element-plus/icons-vue';
import { ApprovalTaskClass } from '@/api/demo/approvalTask/ApprovalTaskClass';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sensor_type, reuse_potsential, certificate_type, quality_inspection_result, resource_type } = toRefs<any>(
  proxy?.useDict('sensor_type', 'reuse_potsential', 'certificate_type', 'quality_inspection_result', 'resource_type')
);
const buttonLoading = ref(false);
const loading = ref(true);

const initialStepFormData = {
  stepRunId: undefined,
  productionBatchId: undefined,
  stepName: undefined,
  startTime: undefined,
  endTime: undefined,
  operatorId: undefined,
  operatorUserName: undefined
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

// Batch Input Link Information
const batchInputLinkList = ref<any[]>([]);

// Waste Product Record Information
const wasteByproductList = ref<any[]>([]);
// Resource Use Record Information
const resourceUseRecordList = ref<any[]>([]);
const qualityCertificateList = ref<any[]>([]);
// Quality Inspection Information
const qualityInspectionList = ref<any[]>([]);

// Batch Input Link Dialog
const batchInputLinkDialog = reactive<DialogOption>({
  visible: false,
  title: 'Add Batch Input Link'
});

const batchInputLinkDialogFormRef = ref<ElFormInstance>();
const initialBatchInputLinkFormData = {
  batchInputLinkId: undefined,
  productionBatchId: undefined,
  intakeId: undefined,
  quantityUsed: undefined,
  unit: undefined
};
const batchInputLinkDialogForm = ref({ ...initialBatchInputLinkFormData });
const batchInputLinkButtonLoading = ref(false);
const batchInputLinkDialogAction = ref('add');

const batchInputLinkDialogRules = {
  intakeId: [{ required: true, message: 'Intake ID cannot be empty', trigger: 'blur' }],
  quantityUsed: [{ required: true, message: 'Quantity Used cannot be empty', trigger: 'blur' }],
  unit: [{ required: true, message: 'Unit cannot be empty', trigger: 'blur' }]
};

// Intake ID remote search
const intakeIdOptions = ref<{ label: string; value: string | number }[]>([]);
const intakeIdList = ref<any[]>([]);
const intakeIdLoading = ref(false);

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
const iotDialogAction = ref('add');

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
  stepName: [{ required: true, message: 'Step Name cannot be empty', trigger: 'blur' }]
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
  try {
    // 使用详情接口获取单条步骤记录，避免通过列表再筛选
    const { data } = await getProcessStepRuns(_stepRunId);
    if (data) {
      Object.assign(stepDialogForm.value, data);
    }
    await getIotSensorReadingList(_stepRunId);
    dialog.visible = true;
    dialog.title = 'View Process Step';
    dialogAction.value = 'view';
  } catch (error) {
    console.error('Failed to view process step:', error);
  }
};

onMounted(async () => {
  nextTick(async () => {
    const productionBatchId = proxy.$route.query.productionBatchId as string;
    if (!productionBatchId) return;

    const { data: productionBatchInfo } = await getProductionBatch(productionBatchId);
    productionBatchForm.value = productionBatchInfo;

    getProcessStepRunList(productionBatchId);
    getBatchInputLinkList(productionBatchId);
    getWasteByproductList(productionBatchId);
    getResourceUseRecordList(productionBatchId);
    getQualityCertificateList(productionBatchId);
    getQualityInspectionList(productionBatchId);
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

/** 获取 Batch Input Link 列表 */
const getBatchInputLinkList = async (productionBatchId: string | number) => {
  try {
    const res = await listBatchInput({
      productionBatchId,
      pageNum: 1,
      pageSize: 1000
    });
    // 处理分页响应或数组响应
    batchInputLinkList.value = res.rows;
  } catch (error) {
    console.error('Failed to load batch input links:', error);
    batchInputLinkList.value = [];
  }
};

/** Intake ID 远程搜索方法 */
const intakeIdRemoteMethod = async (query: string) => {
  if (query) {
    intakeIdLoading.value = true;
    intakeIdOptions.value = intakeIdList.value
      .filter((f) => f.intakeId?.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => ({
        value: item.intakeId,
        label: String(item.intakeId)
      }));
    intakeIdLoading.value = false;
  } else {
    intakeIdOptions.value = [];
  }
};

/** 打开 Batch Input Link Dialog */
const openBatchInputLinkDialog = async () => {
  resetBatchInputLinkDialog();
  batchInputLinkDialog.visible = true;
  batchInputLinkDialog.title = 'Add Batch Input Link';
  batchInputLinkDialogAction.value = 'add';
  batchInputLinkDialogForm.value.productionBatchId = productionBatchForm.value.productionBatchId;
  // 加载所有可用的 intake IDs
  try {
    const res = await listRawMaterialIntake({
      pageNum: 1,
      pageSize: 1000
    });
    intakeIdList.value = res.rows;
    intakeIdOptions.value = intakeIdList.value.map((item) => ({
      value: item.intakeId,
      label: String(item.intakeId)
    }));
  } catch (error) {
    console.error('Failed to load intake IDs:', error);
    intakeIdList.value = [];
    intakeIdOptions.value = [];
  }
};

/** 编辑 Batch Input Link */
const handleEditBatchInputLink = async (row: any) => {
  resetBatchInputLinkDialog();
  try {
    const { data } = await getBatchInput(row.batchInputLinkId);
    // 回填表单数据
    Object.assign(batchInputLinkDialogForm.value, data);
    if (!batchInputLinkDialogForm.value.productionBatchId) {
      batchInputLinkDialogForm.value.productionBatchId = productionBatchForm.value.productionBatchId;
    }
    batchInputLinkDialog.visible = true;
    batchInputLinkDialog.title = 'Edit Batch Input Link';
    batchInputLinkDialogAction.value = 'edit';
  } catch (error) {
    console.error('Failed to load Batch Input Link detail:', error);
  }
};

/** 查看 Batch Input Link */
const handleViewBatchInputLink = async (row: any) => {
  resetBatchInputLinkDialog();
  try {
    const { data } = await getBatchInput(row.batchInputLinkId);
    Object.assign(batchInputLinkDialogForm.value, data);
    // 确保当前 Intake ID 在下拉选项中
    if (data.intakeId) {
      const exists = intakeIdOptions.value.some((opt) => opt.value === data.intakeId);
      if (!exists) {
        intakeIdOptions.value.unshift({
          value: data.intakeId,
          label: String(data.intakeId)
        });
      }
    }
    batchInputLinkDialog.visible = true;
    batchInputLinkDialog.title = 'View Batch Input Link';
    batchInputLinkDialogAction.value = 'view';
  } catch (error) {
    console.error('Failed to load Batch Input Link detail:', error);
  }
};

/** 删除 Batch Input Link */
const handleDeleteBatchInputLink = async (row: any) => {
  try {
    await proxy?.$modal.confirm('Are you sure you want to delete this Batch Input Link?');
    await delBatchInput(row.batchInputLinkId);
    proxy?.$modal.msgSuccess('Batch Input Link deleted successfully');
    if (productionBatchForm.value.productionBatchId) {
      await getBatchInputLinkList(productionBatchForm.value.productionBatchId);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete Batch Input Link:', error);
    }
  }
};

/** Batch Input Link Dialog 确认 */
const handleBatchInputLinkDialogConfirm = () => {
  batchInputLinkDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    batchInputLinkButtonLoading.value = true;
    try {
      if (batchInputLinkDialogAction.value === 'add') {
        await addBatchInput(batchInputLinkDialogForm.value);
        proxy.$modal.msgSuccess('Batch Input Link added successfully');
      } else if (batchInputLinkDialogAction.value === 'edit') {
        await updateBatchInput(batchInputLinkDialogForm.value);
        proxy.$modal.msgSuccess('Batch Input Link updated successfully');
      }
      batchInputLinkDialog.visible = false;
      // 刷新 Batch Input Link 列表
      if (productionBatchForm.value.productionBatchId) {
        await getBatchInputLinkList(productionBatchForm.value.productionBatchId);
      }
      resetBatchInputLinkDialog();
    } catch (error) {
      console.error('Failed to add Batch Input Link:', error);
    } finally {
      batchInputLinkButtonLoading.value = false;
    }
  });
};

/** Batch Input Link Dialog 取消 */
const handleBatchInputLinkDialogCancel = () => {
  batchInputLinkDialog.visible = false;
  resetBatchInputLinkDialog();
};

// Quality Inspection Dialog
const qualityInspectionDialog = reactive<DialogOption>({
  visible: false,
  title: 'View Quality Inspection'
});

const qualityInspectionDialogFormRef = ref<ElFormInstance>();
const initialQualityInspectionFormData = {
  inspectionId: undefined,
  productionBatchId: undefined,
  inspectorId: undefined,
  inspectorUserName: undefined,
  inspectionDate: undefined,
  qualityScore: undefined,
  result: undefined
};
const qualityInspectionDialogForm = ref({ ...initialQualityInspectionFormData });

// Lab Test List (for Quality Inspection)
const labTestList = ref<any[]>([]);

// Waste Product Record Dialog
const wasteByproductDialog = reactive<DialogOption>({
  visible: false,
  title: 'Add Waste Product Record'
});

const wasteByproductDialogFormRef = ref<ElFormInstance>();
const initialWasteByproductFormData = {
  wasteRecordId: undefined,
  productionBatchId: undefined,
  wasteType: undefined,
  quantity: undefined,
  reusePotential: undefined
};
const wasteByproductDialogForm = ref({ ...initialWasteByproductFormData });
const wasteByproductButtonLoading = ref(false);
const wasteByproductDialogAction = ref('add');

const wasteByproductDialogRules = {
  wasteType: [{ required: true, message: 'Waste Type cannot be empty', trigger: 'blur' }],
  quantity: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }]
};

// Resource Use Record Dialog
const resourceUseRecordDialog = reactive<DialogOption>({
  visible: false,
  title: 'Add Resource Use Record'
});

const resourceUseRecordDialogFormRef = ref<ElFormInstance>();
const initialResourceUseRecordFormData = {
  resourceRecordId: undefined,
  productionBatchId: undefined,
  resourceType: undefined,
  quantityUsed: undefined,
  measurementTime: undefined
};
const resourceUseRecordDialogForm = ref({ ...initialResourceUseRecordFormData });
const resourceUseRecordButtonLoading = ref(false);
const resourceUseRecordDialogAction = ref('add');

const resourceUseRecordDialogRules = {
  resourceType: [{ required: true, message: 'Resource Type cannot be empty', trigger: 'blur' }],
  quantityUsed: [{ required: true, message: 'Quantity Used cannot be empty', trigger: 'blur' }],
  measurementTime: [{ required: true, message: 'Measurement Time cannot be empty', trigger: 'blur' }]
};

/** 获取 Waste Product Record 列表 */
const getWasteByproductList = async (productionBatchId: string | number) => {
  if (!productionBatchId) {
    wasteByproductList.value = [];
    return;
  }
  try {
    const res = await listWasteByproductRecord({
      productionBatchId,
      pageNum: 1,
      pageSize: 1000
    });
    // 处理分页响应或数组响应
    wasteByproductList.value = res.rows || [];
  } catch (error) {
    console.error('Failed to load Waste Product Record list:', error);
    wasteByproductList.value = [];
  }
};

/** 获取 Resource Use Record 列表 */
const getResourceUseRecordList = async (productionBatchId: string | number) => {
  if (!productionBatchId) {
    resourceUseRecordList.value = [];
    return;
  }
  try {
    const res = await listResourceUseRecord({
      productionBatchId,
      pageNum: 1,
      pageSize: 1000
    });
    // 处理分页响应或数组响应
    resourceUseRecordList.value = (res as any).rows || (res as any) || [];
  } catch (error) {
    console.error('Failed to load Resource Use Record list:', error);
    resourceUseRecordList.value = [];
  }
};

/** 打开 Resource Use Record Dialog */
const openResourceUseRecordDialog = () => {
  resetResourceUseRecordDialog();
  resourceUseRecordDialogForm.value.productionBatchId = productionBatchForm.value.productionBatchId;
  resourceUseRecordDialog.visible = true;
  resourceUseRecordDialog.title = 'Add Resource Use Record';
  resourceUseRecordDialogAction.value = 'add';
};

/** Resource Use Record Dialog 确认 */
const handleResourceUseRecordDialogConfirm = () => {
  resourceUseRecordDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    resourceUseRecordButtonLoading.value = true;
    try {
      if (resourceUseRecordDialogAction.value === 'add') {
        await addResourceUseRecord(resourceUseRecordDialogForm.value);
        proxy?.$modal.msgSuccess('Resource Use Record added successfully');
      } else if (resourceUseRecordDialogAction.value === 'edit') {
        await updateResourceUseRecord(resourceUseRecordDialogForm.value);
        proxy?.$modal.msgSuccess('Resource Use Record updated successfully');
      }
      resourceUseRecordDialog.visible = false;
      if (productionBatchForm.value.productionBatchId) {
        await getResourceUseRecordList(productionBatchForm.value.productionBatchId);
      }
      resetResourceUseRecordDialog();
    } catch (error) {
      console.error('Failed to save Resource Use Record:', error);
    } finally {
      resourceUseRecordButtonLoading.value = false;
    }
  });
};

/** Resource Use Record Dialog 取消 */
const handleResourceUseRecordDialogCancel = () => {
  resourceUseRecordDialog.visible = false;
  resetResourceUseRecordDialog();
};

/** 重置 Resource Use Record Dialog */
const resetResourceUseRecordDialog = () => {
  resourceUseRecordDialogForm.value = { ...initialResourceUseRecordFormData };
  resourceUseRecordDialogFormRef.value?.resetFields();
};

/** 编辑 Resource Use Record */
const handleEditResourceUseRecord = async (row: any) => {
  resetResourceUseRecordDialog();
  try {
    const { data } = await getResourceUseRecord(row.resourceRecordId);
    Object.assign(resourceUseRecordDialogForm.value, data);
    if (!resourceUseRecordDialogForm.value.productionBatchId) {
      resourceUseRecordDialogForm.value.productionBatchId = productionBatchForm.value.productionBatchId;
    }
    resourceUseRecordDialog.visible = true;
    resourceUseRecordDialog.title = 'Edit Resource Use Record';
    resourceUseRecordDialogAction.value = 'edit';
  } catch (error) {
    console.error('Failed to load Resource Use Record detail:', error);
  }
};

/** 查看 Resource Use Record */
const handleViewResourceUseRecord = async (row: any) => {
  resetResourceUseRecordDialog();
  try {
    const { data } = await getResourceUseRecord(row.resourceRecordId);
    Object.assign(resourceUseRecordDialogForm.value, data);
    resourceUseRecordDialog.visible = true;
    resourceUseRecordDialog.title = 'View Resource Use Record';
    resourceUseRecordDialogAction.value = 'view';
  } catch (error) {
    console.error('Failed to load Resource Use Record detail:', error);
  }
};

/** 删除 Resource Use Record */
const handleDeleteResourceUseRecord = async (row: any) => {
  try {
    await proxy?.$modal.confirm('Are you sure you want to delete this Resource Use Record?');
    await delResourceUseRecord(row.resourceRecordId);
    proxy?.$modal.msgSuccess('Resource Use Record deleted successfully');
    if (productionBatchForm.value.productionBatchId) {
      await getResourceUseRecordList(productionBatchForm.value.productionBatchId);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete Resource Use Record:', error);
    }
  }
};

/** 获取 Quality Inspection 列表 */
const getQualityInspectionList = async (productionBatchId: string | number) => {
  if (!productionBatchId) {
    qualityInspectionList.value = [];
    return;
  }
  try {
    const res = await listQualityInspectionProcess({
      productionBatchId,
      pageNum: 1,
      pageSize: 1000
    });
    // 处理分页响应或数组响应
    qualityInspectionList.value = (res as any).rows || (res as any) || [];
  } catch (error) {
    console.error('Failed to load Quality Inspection list:', error);
    qualityInspectionList.value = [];
  }
};

/** 查看 Quality Inspection Process */
const handleViewQualityInspection = async (row: any) => {
  try {
    // 优先通过 inspectionId 调用详情接口，保证拿到完整数据（含 inspectorUserName 等）
    const { data } = await getQualityInspectionProcess(row.inspectionId);
    const detail = data || row;
    resetQualityInspectionDialog();
    Object.assign(qualityInspectionDialogForm.value, detail);
    // 加载对应的 LAB_TEST 列表
    const labRes = await listLabTest({
      inspectionId: detail.inspectionId,
      pageNum: 1,
      pageSize: 1000
    });
    labTestList.value = (labRes as any).rows || (labRes as any) || [];
    qualityInspectionDialog.visible = true;
    qualityInspectionDialog.title = 'View Quality Inspection';
  } catch (error) {
    console.error('Failed to view Quality Inspection:', error);
  }
};

/** Quality Inspection Dialog 取消 */
const handleQualityInspectionDialogCancel = () => {
  qualityInspectionDialog.visible = false;
  resetQualityInspectionDialog();
};

/** 重置 Quality Inspection Dialog */
const resetQualityInspectionDialog = () => {
  qualityInspectionDialogForm.value = { ...initialQualityInspectionFormData };
  qualityInspectionDialogFormRef.value?.resetFields();
  labTestList.value = [];
};

/** 打开 Waste Product Record Dialog */
const openWasteByproductDialog = () => {
  resetWasteByproductDialog();
  wasteByproductDialogForm.value.productionBatchId = productionBatchForm.value.productionBatchId;
  wasteByproductDialog.visible = true;
  wasteByproductDialog.title = 'Add Waste Product Record';
  wasteByproductDialogAction.value = 'add';
};

/** 编辑 Waste Product Record */
const handleEditWasteByproduct = async (row: any) => {
  resetWasteByproductDialog();
  const res = await getWasteByproductRecord(row.wasteRecordId);
  Object.assign(wasteByproductDialogForm.value, res.data);
  wasteByproductDialog.visible = true;
  wasteByproductDialog.title = 'Edit Waste Product Record';
  wasteByproductDialogAction.value = 'edit';
};

/** 查看 Waste Product Record */
const handleViewWasteByproduct = async (row: any) => {
  resetWasteByproductDialog();
  const res = await getWasteByproductRecord(row.wasteRecordId);
  Object.assign(wasteByproductDialogForm.value, res.data);
  wasteByproductDialog.visible = true;
  wasteByproductDialog.title = 'View Waste Product Record';
  wasteByproductDialogAction.value = 'view';
};

/** 删除 Waste Product Record */
const handleDeleteWasteByproduct = async (row: any) => {
  try {
    await proxy?.$modal.confirm('Are you sure you want to delete this Waste Product Record?');
    await delWasteByproductRecord(row.wasteRecordId);
    proxy?.$modal.msgSuccess('Waste Product Record deleted successfully');
    if (productionBatchForm.value.productionBatchId) {
      await getWasteByproductList(productionBatchForm.value.productionBatchId);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete Waste Product Record:', error);
    }
  }
};

/** Waste Product Record Dialog 确认 */
const handleWasteByproductDialogConfirm = () => {
  wasteByproductDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    wasteByproductButtonLoading.value = true;
    try {
      if (wasteByproductDialogAction.value === 'add') {
        await addWasteByproductRecord(wasteByproductDialogForm.value);
        proxy.$modal.msgSuccess('Waste Product Record added successfully');
      } else if (wasteByproductDialogAction.value === 'edit') {
        await updateWasteByproductRecord(wasteByproductDialogForm.value);
        proxy.$modal.msgSuccess('Waste Product Record updated successfully');
      }
      wasteByproductDialog.visible = false;
      // 刷新 Waste Product Record 列表
      if (productionBatchForm.value.productionBatchId) {
        await getWasteByproductList(productionBatchForm.value.productionBatchId);
      }
      resetWasteByproductDialog();
    } catch (error) {
      console.error('Failed to save Waste Product Record:', error);
    } finally {
      wasteByproductButtonLoading.value = false;
    }
  });
};

/** Waste Product Record Dialog 取消 */
const handleWasteByproductDialogCancel = () => {
  wasteByproductDialog.visible = false;
  resetWasteByproductDialog();
};

/** 重置 Waste Product Record Dialog */
const resetWasteByproductDialog = () => {
  wasteByproductDialogForm.value = { ...initialWasteByproductFormData };
  wasteByproductDialogFormRef.value?.resetFields();
};

// Quality Certificate Dialog
const qualityCertificateDialog = reactive<DialogOption>({
  visible: false,
  title: 'View Quality Certificate'
});

const qualityCertificateDialogFormRef = ref<ElFormInstance>();
const initialQualityCertificateFormData = {
  certificateId: undefined,
  productionBatchId: undefined,
  certificateType: undefined,
  issuingBody: undefined,
  validUntil: undefined,
  documentUrl: undefined
};
const qualityCertificateDialogForm = ref({ ...initialQualityCertificateFormData });

/** 获取 Quality Certificate 列表 */
const getQualityCertificateList = async (productionBatchId: string | number) => {
  if (!productionBatchId) {
    qualityCertificateList.value = [];
    return;
  }
  try {
    const res = await listQualityCertificate({
      productionBatchId,
      pageNum: 1,
      pageSize: 1000
    });
    // 处理分页响应或数组响应
    qualityCertificateList.value = res.rows || res.data || [];
  } catch (error) {
    console.error('Failed to load Quality Certificate list:', error);
    qualityCertificateList.value = [];
  }
};

/** 查看 Quality Certificate */
const handleViewQualityCertificate = async (row: any) => {
  resetQualityCertificateDialog();
  const res = await getQualityCertificate(row.certificateId);
  Object.assign(qualityCertificateDialogForm.value, res.data);
  qualityCertificateDialog.visible = true;
  qualityCertificateDialog.title = 'View Quality Certificate';
};

/** Quality Certificate Dialog 取消 */
const handleQualityCertificateDialogCancel = () => {
  qualityCertificateDialog.visible = false;
  resetQualityCertificateDialog();
};

/** 重置 Quality Certificate Dialog */
const resetQualityCertificateDialog = () => {
  qualityCertificateDialogForm.value = { ...initialQualityCertificateFormData };
  qualityCertificateDialogFormRef.value?.resetFields();
};

/** 重置 Batch Input Link Dialog 表单 */
const resetBatchInputLinkDialog = () => {
  batchInputLinkDialogForm.value = { ...initialBatchInputLinkFormData };
  batchInputLinkDialogFormRef.value?.resetFields();
};

/** 表单重置 */
const reset = () => {
  stepDialogForm.value = { ...initialStepFormData };
  iotSensorReadingList.value = [];
  stepDialogFormRef.value?.resetFields();
};

// 确认按钮
const handleSave = async () => {
  buttonLoading.value = true;
  try {
    // 只更新状态为 Running
    productionBatchForm.value.status = ProductionBatchStatus.Running.toString();

    const approvalTaskForm = new ApprovalTaskClass({
      businessKey: productionBatchForm.value.productionBatchId != null ? String(productionBatchForm.value.productionBatchId) : undefined,
      businessType: BusinessType.PlanningAndProtocol.toString(),
      taskName: PlanningAndProtocolTaskName.ExecutePlan.toString(),
      approvalStatus: ProductionBatchStatus.Running.toString()
    });
    await updateProductionBatch({ ...productionBatchForm.value, approvalTaskForm }).finally(() => (buttonLoading.value = false));
    proxy?.$modal.msgSuccess('success');
    handleCancel();
  } finally {
    buttonLoading.value = false;
  }
};

// 完成按钮
const handleComplete = async () => {
  // 检查是否有证书存在
  if (!qualityCertificateList.value || qualityCertificateList.value.length === 0) {
    proxy?.$modal.msgError('Cannot complete: Quality certificate is required');
    return;
  }
  buttonLoading.value = true;
  try {
    // 更新状态为 Completed
    productionBatchForm.value.status = ProductionBatchStatus.Completed.toString();

    const approvalTaskForm = new ApprovalTaskClass({
      businessKey: productionBatchForm.value.productionBatchId != null ? String(productionBatchForm.value.productionBatchId) : undefined,
      businessType: BusinessType.PlanningAndProtocol.toString(),
      taskName: PlanningAndProtocolTaskName.CompletePlan.toString(),
      approvalStatus: ProductionBatchStatus.Completed.toString()
    });
    await updateProductionBatch({ ...productionBatchForm.value, approvalTaskForm }).finally(() => (buttonLoading.value = false));
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
  return productionBatchForm.value.status === ProductionBatchStatus.Running.toString();
};

/** 打开 IoT Dialog */
const openIotDialog = () => {
  resetIotDialog();
  iotDialog.visible = true;
  iotDialog.title = 'Add IOT Information';
  iotDialogAction.value = 'add';
  iotDialogForm.value.stepRunId = stepDialogForm.value.stepRunId;
};

/** 编辑 IoT 信息 */
const handleEditIot = async (row: any) => {
  resetIotDialog();
  try {
    const res = await getIotSensorReading(row.sensorReadingId);
    Object.assign(iotDialogForm.value, res.data);
    iotDialog.visible = true;
    iotDialog.title = 'Edit IOT Information';
    iotDialogAction.value = 'edit';
  } catch (error) {
    console.error('Failed to load IOT information:', error);
  }
};

/** 查看 IoT 信息 */
const handleViewIot = async (row: any) => {
  resetIotDialog();
  try {
    const res = await getIotSensorReading(row.sensorReadingId);
    Object.assign(iotDialogForm.value, res.data);
    iotDialog.visible = true;
    iotDialog.title = 'View IOT Information';
    iotDialogAction.value = 'view';
  } catch (error) {
    console.error('Failed to load IOT information:', error);
  }
};

/** 删除 IoT 信息 */
const handleDeleteIot = async (row: any) => {
  try {
    await proxy.$modal.confirm('Are you sure you want to delete this IOT information?');
    await delIotSensorReading(row.sensorReadingId);
    proxy.$modal.msgSuccess('IOT Information deleted successfully');
    // 刷新 IoT 列表
    if (stepDialogForm.value.stepRunId) {
      await getIotSensorReadingList(stepDialogForm.value.stepRunId);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete IOT information:', error);
    }
  }
};

/** IoT Dialog 确认 */
const handleIotDialogConfirm = () => {
  iotDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    iotButtonLoading.value = true;
    try {
      if (iotDialogAction.value === 'add') {
        await addIotSensorReading(iotDialogForm.value);
        proxy.$modal.msgSuccess('IOT Information added successfully');
      } else if (iotDialogAction.value === 'edit') {
        await updateIotSensorReading(iotDialogForm.value);
        proxy.$modal.msgSuccess('IOT Information updated successfully');
      }
      iotDialog.visible = false;
      // 刷新 IoT 列表
      if (stepDialogForm.value.stepRunId) {
        await getIotSensorReadingList(stepDialogForm.value.stepRunId);
      }
      resetIotDialog();
    } catch (error) {
      console.error('Failed to save IOT information:', error);
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
</script>

<style scoped>
.inline-form-panel {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 16px;
  margin: 12px 0;
  background: #fafafa;
}

.inline-form-panel__header {
  font-weight: 600;
  font-size: 15px;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.inline-form-panel__footer {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}
</style>
