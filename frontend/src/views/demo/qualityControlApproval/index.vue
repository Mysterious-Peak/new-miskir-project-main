<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Batch Id" prop="productionBatchId">
              <el-select
                v-model="queryParams.productionBatchId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionBatchIdRemoteMethod"
                :loading="productionBatchIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productionBatchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Processor Id" prop="processorId">
              <el-select
                v-model="queryParams.processorId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="processorIdRemoteMethod"
                :loading="processorIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in processorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Product Id" prop="productId">
              <el-select
                v-model="queryParams.productId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productIdRemoteMethod"
                :loading="productIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productIdOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe fit :data="productionBatchList" @selection-change="handleSelectionChange">
        <el-table-column
          label="Production Batch Id"
          align="center"
          prop="productionBatchId"
          v-if="true"
          :min-width="getColumnWidth('Production Batch Id')"
        />
        <el-table-column label="Processor ID" align="center" prop="processorId" :min-width="getColumnWidth('Processor Id')" />
        <el-table-column label="Product ID" align="center" prop="productId" :min-width="getColumnWidth('Product Id')" />
        <el-table-column label="Inspection ID" align="center" prop="inspectionId" :min-width="getColumnWidth('Inspection ID')" />
        <el-table-column label="Protocol Version" align="center" prop="protocolVersion" :min-width="getColumnWidth('Protocol Version')" />
        <el-table-column label="Start Time" align="center" prop="startTime" width="180" :min-width="getColumnWidth('Start Time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="End Time" align="center" prop="endTime" width="180" :min-width="getColumnWidth('End Time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Quality Score" align="center" prop="qualityScore" :min-width="getColumnWidth('Quality Score')" />
        <el-table-column label="Result" align="center" prop="result" :min-width="getColumnWidth('result')" width="120px">
          <template #default="scope">
            <!-- result 为 '2' 时不显示任何内容，其它情况显示 Pass / Fail，并用颜色区分 -->
            <span v-if="String(scope.row.result) === '2'"></span>
            <el-tag v-else :type="String(scope.row.result) === QualityControlResultStatus.Fail.toString() ? 'danger' : 'success'">
              {{ QualityControlResultStatus[scope.row.result as QualityControlResultStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')" width="120px">
          <template #default="scope">
            <el-tag>{{ QualityControlStatus[scope.row.status as QualityControlStatus] }}</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Result" align="center" prop="result" :min-width="getColumnWidth('result')" width="120px">
          <template #default="scope">
            <el-tag>{{ QualityControlResultStatus[scope.row.result as QualityControlResultStatus] }}</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
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
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
            <!-- <el-tooltip content="Delete" placement="top" v-if="!isViewFlag(scope.row)">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改生产批次对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="productionBatchFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Batch Id" prop="productionBatchId" v-show="isShow">
          <el-input v-model="form.productionBatchId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Processor Id" prop="processorId">
          <el-select
            v-model="form.processorId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="processorIdPopRemoteMethod"
            :loading="processorIdPopLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
            clearable
          >
            <el-option v-for="item in processorIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.processorId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Product Id" prop="productId">
          <el-select
            v-model="form.productId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productIdPopRemoteMethod"
            :loading="productIdPopLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
            clearable
          >
            <el-option v-for="item in productIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.productId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Protocol Version" prop="protocolVersion">
          <el-input v-model="form.protocolVersion" placeholder="Please input" :disabled="isViewFlag(form)" clearable />
        </el-form-item>
        <el-form-item label="Start Time" prop="startTime">
          <el-date-picker
            clearable
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="End Time" prop="endTime">
          <el-date-picker
            clearable
            v-model="form.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Created By" prop="createdUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Creation Date" prop="createTime" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.createTime" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item v-if="!isViewFlag(form)">
          <el-button type="primary" @click="handleAddStep" style="width: fit-content !important">add step</el-button>
        </el-form-item>

        <el-table stripe fit border :data="processStepRunList" class="mt-2">
          <el-table-column label="Step Run ID" align="center" prop="stepRunId" :min-width="getColumnWidth('Step Run ID')" />
          <el-table-column label="Step Name" align="center" prop="stepName" :min-width="getColumnWidth('Step Name')" />
          <el-table-column label="Start Time" align="center" prop="startTime" width="180" :min-width="getColumnWidth('Start Time')">
            <template #default="scope">
              <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="End Time" align="center" prop="endTime" width="180" :min-width="getColumnWidth('End Time')">
            <template #default="scope">
              <span v-if="scope.row.endTime">{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="Operator ID" align="center" prop="operatorId" :min-width="getColumnWidth('Operator ID')" />
          <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" v-if="!isViewFlag(form)" width="210">
            <template #default="scope">
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleEditStep(scope.row)">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleRemoveStep(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center" v-if="form.status">
          <el-button icon="SendPlane"
            :loading="buttonLoading"
            type="primary"
            @click="submitForm"
            v-if="
              (form.status == ProductionBatchStatus.Draft.toString() && form.productionBatchId) ||
              form.status == ProductionBatchStatus.NeedRevision.toString()
            "
            >Submit</el-button
          >
          <el-button
            :loading="buttonLoading"
            type="primary"
            @click="saveForm"
            v-if="form.status == ProductionBatchStatus.Draft.toString() || form.status == ProductionBatchStatus.NeedRevision.toString()"
            >Save</el-button
          >
          <el-button @click="cancel" v-if="!isViewFlag(form)">Cancel</el-button>
          <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改处理步骤对话框 -->
    <el-dialog :title="stepDialog.title" v-model="stepDialog.visible" width="500px" append-to-body>
      <el-form ref="processStepRunFormRef" :model="stepForm" :rules="stepRules" label-width="auto">
        <el-form-item label="Step Run ID" prop="stepRunId" v-if="stepDialogAction !== 'add'">
          <el-input v-model="stepForm.stepRunId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Step Name" prop="stepName">
          <el-input v-model="stepForm.stepName" placeholder="Please input" clearable />
        </el-form-item>
        <el-form-item label="Start Time" prop="startTime">
          <el-date-picker clearable v-model="stepForm.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="End Time" prop="endTime">
          <el-date-picker clearable v-model="stepForm.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Operator ID" prop="operatorId">
          <el-input v-model="stepForm.operatorId" placeholder="Please input" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button :loading="stepButtonLoading" type="primary" @click="submitStepForm">Save</el-button>
          <el-button @click="cancelStep">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ProductionBatch" lang="ts">
import { listAgroprocessor } from '@/api/demo/agroprocessor';
import { AgroprocessorVO } from '@/api/demo/agroprocessor/types';
import { listProcessorProduct } from '@/api/demo/processorProduct';
import { ProcessorProductVO } from '@/api/demo/processorProduct/types';
import { listProcessStepRuns } from '@/api/demo/processStepRuns';
import {
  delProductionBatch,
  getProductionBatch,
  listProductionBatch,
  listProductionBatchWithQualityInspection,
  saveProductionBatchWithSteps,
  updateProductionBatchWithSteps
} from '@/api/demo/productionBatch';
import { ProductionBatchForm, ProductionBatchQuery, ProductionBatchVO } from '@/api/demo/productionBatch/types';
import { ProductionBatchStatus, QualityControlStatus, QualityControlResultStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用 any[] 以兼容带有质检结果扩展字段的返回类型
const productionBatchList = ref<any[]>([]);
const productionBatchAllList = ref<ProductionBatchVO[]>([]);
const agroprocessorList = ref<AgroprocessorVO[]>([]);
const processorProductList = ref<ProcessorProductVO[]>([]);
const processStepRunList = ref<any[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const productionBatchFormRef = ref<ElFormInstance>();
const processStepRunFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const stepDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const stepDialogAction = ref('');

const initStepFormData = {
  stepRunId: undefined,
  productionBatchId: undefined,
  stepName: undefined,
  startTime: undefined,
  endTime: undefined,
  operatorId: undefined
};

const stepForm = ref({ ...initStepFormData });
const stepButtonLoading = ref(false);

const stepRules = {
  stepName: [{ required: true, message: 'Step Name cannot be empty', trigger: 'blur' }],
  operatorId: [{ required: true, message: 'Operator ID cannot be empty', trigger: 'blur' }]
};

const initFormData: ProductionBatchForm = {
  productionBatchId: undefined,
  processorId: undefined,
  productId: undefined,
  protocolVersion: undefined,
  startTime: undefined,
  endTime: undefined,
  status: ProductionBatchStatus.Draft.toString()
};
const data = reactive<PageData<ProductionBatchForm, ProductionBatchQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productionBatchId: undefined,
    processorId: undefined,
    productId: undefined,
    protocolVersion: undefined,
    startTime: undefined,
    endTime: undefined,
    status: undefined,
    params: {}
    // orderByColumn: 'createTime',
    // isAsc: 'desc'
  },
  rules: {
    processorId: [{ required: true, message: 'Processor Id cannot be empty', trigger: 'blur' }],
    productId: [{ required: true, message: 'Product Id cannot be empty', trigger: 'blur' }],
    protocolVersion: [{ required: false, message: 'Protocol Version cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const productionBatchIdOptions = ref([]);
const productionBatchIdList = ref([]);
const productionBatchIdLoading = ref(false);
const productionBatchIdRemoteMethod = async (query: string) => {
  if (query) {
    productionBatchIdList.value = productionBatchAllList.value
      .filter((f) => f.productionBatchId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.productionBatchId);
    productionBatchIdLoading.value = true;
    productionBatchIdOptions.value = productionBatchIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    productionBatchIdLoading.value = false;
  } else {
    productionBatchIdOptions.value = [];
  }
};

const processorIdOptions = ref([]);
const processorIdList = ref([]);
const processorIdLoading = ref(false);
const processorIdRemoteMethod = async (query: string) => {
  if (query) {
    processorIdList.value = [
      ...new Set(
        productionBatchAllList.value
          .filter((f) => f.processorId.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.processorId)
      )
    ];
    processorIdLoading.value = true;
    processorIdOptions.value = processorIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    processorIdLoading.value = false;
  } else {
    processorIdOptions.value = [];
  }
};

const productIdOptions = ref([]);
const productIdList = ref([]);
const productIdLoading = ref(false);
const productIdRemoteMethod = async (query: string) => {
  if (query) {
    productIdList.value = [
      ...new Set(
        productionBatchAllList.value.filter((f) => f.productId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.productId)
      )
    ];
    productIdLoading.value = true;
    productIdOptions.value = productIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    productIdLoading.value = false;
  } else {
    productIdOptions.value = [];
  }
};

const processorIdPopOptions = ref([]);
const processorIdPopLoading = ref(false);
const processorIdPopRemoteMethod = async (query: string) => {
  if (query) {
    processorIdPopLoading.value = true;
    const list = agroprocessorList.value
      .filter((f) => f.processorId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.processorId);
    processorIdPopOptions.value = list.map((item) => ({
      value: item,
      label: item
    }));
    processorIdPopLoading.value = false;
  } else {
    processorIdPopOptions.value = [];
  }
};

const productIdPopOptions = ref([]);
const productIdPopLoading = ref(false);
const productIdPopRemoteMethod = async (query: string) => {
  if (query) {
    productIdPopLoading.value = true;
    const list = processorProductList.value
      .filter((f) => f.productId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.productId);
    productIdPopOptions.value = list.map((item) => ({
      value: item,
      label: item
    }));
    productIdPopLoading.value = false;
  } else {
    productIdPopOptions.value = [];
  }
};

/** 查询生产批次列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProductionBatchWithQualityInspection(queryParams.value);
  productionBatchList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查询生产批次列表 */
const getAllList = async () => {
  loading.value = true;
  const res = await listProductionBatch();
  productionBatchAllList.value = res.rows;
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
  productionBatchFormRef.value?.resetFields();
  processStepRunList.value = [];
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
const handleSelectionChange = (selection: ProductionBatchVO[]) => {
  ids.value = selection.map((item) => item.productionBatchId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const dialogAction = ref('');

const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Production Batch';
  dialogAction.value = 'add';
  const res1 = await listAgroprocessor();
  agroprocessorList.value = res1.rows;
  const res2 = await listProcessorProduct();
  // processorProductList.value = res2.rows;
  processorProductList.value = [
    {
      productId: 'P001',
      processorId: 'PR001',
      productName: '有机苹果干',
      productCategory: '水果制品',
      standardReference: 'GB/T 12345-2020',
      packagingType: '真空包装',
      exportEligible: 1,
      status: 'Approved',
      approvedBy: 1,
      approvedComment: '产品符合出口标准',
      approvedAt: '2025-01-15 10:30:00'
    },
    {
      productId: 'P002',
      processorId: 'PR001',
      productName: '有机蓝莓干',
      productCategory: '水果制品',
      standardReference: 'GB/T 12345-2020',
      packagingType: '真空包装',
      exportEligible: 1,
      status: 'Approved',
      approvedBy: 1,
      approvedComment: '产品符合出口标准',
      approvedAt: '2025-01-16 14:20:00'
    },
    {
      productId: 'P003',
      processorId: 'PR002',
      productName: '有机核桃仁',
      productCategory: '坚果制品',
      standardReference: 'GB/T 67890-2021',
      packagingType: '密封袋装',
      exportEligible: 0,
      status: 'Approved',
      approvedBy: 2,
      approvedComment: '仅限内销',
      approvedAt: '2025-01-17 09:15:00'
    },
    {
      productId: 'P004',
      processorId: 'PR002',
      productName: '有机杏仁',
      productCategory: '坚果制品',
      standardReference: 'GB/T 67890-2021',
      packagingType: '密封袋装',
      exportEligible: 1,
      status: 'Approved',
      approvedBy: 2,
      approvedComment: '产品符合出口标准',
      approvedAt: '2025-01-18 11:45:00'
    },
    {
      productId: 'P005',
      processorId: 'PR003',
      productName: '有机蜂蜜',
      productCategory: '蜂产品',
      standardReference: 'GB/T 11111-2019',
      packagingType: '玻璃瓶装',
      exportEligible: 1,
      status: 'Approved',
      approvedBy: 1,
      approvedComment: '产品符合出口标准',
      approvedAt: '2025-01-19 16:30:00'
    }
  ];
};

/** 获取处理步骤列表 */
const getProcessStepRunList = async (productionBatchId: string | number) => {
  if (!productionBatchId) {
    processStepRunList.value = [];
    return;
  }
  try {
    const res = await listProcessStepRuns({
      productionBatchId,
      pageNum: 1,
      pageSize: 1000
    });
    processStepRunList.value = res.rows || [];
  } catch (error) {
    console.error('Failed to load process step runs:', error);
    processStepRunList.value = [];
  }
};

/** 查看按钮操作 */
const handleView = async (row?: ProductionBatchVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `qualityControlApproveDetail`,
    query: {
      productionBatchId: row?.productionBatchId || ids.value[0],
      // 将当前行的 Inspection ID 一并传给详情页
      inspectionId: (row as any)?.inspectionId,
      mode: 'view'
    }
  });
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ProductionBatchVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `qualityControlApproveDetail`,
    query: {
      productionBatchId: row?.productionBatchId || ids.value[0],
      // 将当前行的 Inspection ID 一并传给详情页
      inspectionId: (row as any)?.inspectionId,
      mode: 'edit'
    }
  });
};

/** 保存按钮 */
const saveForm = () => {
  productionBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        // 如果当前状态是 Submitted，保持 Submitted；否则设置为 Draft
        if (form.value.status !== ProductionBatchStatus.Submitted.toString()) {
          form.value.status = ProductionBatchStatus.Draft.toString();
        }

        const steps = (processStepRunList.value || []).map((step) => {
          const stepData = { ...step };
          return stepData;
        });

        if (!steps || steps.length === 0) {
          proxy?.$modal.msgError('Please add at least one process step before saving');
          buttonLoading.value = false;
          return;
        }

        if (form.value.productionBatchId) {
          // 编辑：同时更新 batch 和 steps
          await updateProductionBatchWithSteps({
            productionBatch: form.value,
            processSteps: steps
          });
        } else {
          // 新增：同时保存 batch 和 steps
          const res = await saveProductionBatchWithSteps({
            productionBatch: form.value,
            processSteps: steps
          });
        }

        proxy?.$modal.msgSuccess('success');
        dialog.visible = false;
        await getList();
        await getAllList();
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** 提交按钮 */
const submitForm = () => {
  productionBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      dialog.visible = false;
      try {
        form.value.status = ProductionBatchStatus.Submitted.toString();

        const steps = (processStepRunList.value || []).map((step) => {
          const stepData = { ...step };
          return stepData;
        });

        if (!steps || steps.length === 0) {
          proxy?.$modal.msgError('Please add at least one process step before submitting');
          buttonLoading.value = false;
          return;
        }

        if (form.value.productionBatchId) {
          // 编辑：同时更新 batch 和 steps
          await updateProductionBatchWithSteps({
            productionBatch: form.value,
            processSteps: steps
          });
        } else {
          // 新增：同时保存 batch 和 steps
          const res = await saveProductionBatchWithSteps({
            productionBatch: form.value,
            processSteps: steps
          });
        }

        proxy?.$modal.msgSuccess('success');
        dialog.visible = false;
        await getList();
        await getAllList();
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** 提交按钮操作 */
const handleSubmit = async (row: ProductionBatchVO) => {
  try {
    loading.value = true;
    // 获取步骤列表
    const stepRes = await listProcessStepRuns({
      productionBatchId: row.productionBatchId,
      pageNum: 1,
      pageSize: 1000
    });

    const steps = stepRes.rows || [];

    if (!steps || steps.length === 0) {
      proxy?.$modal.msgError('Please add at least one process step before submitting');
      loading.value = false;
      return;
    }

    // 更新状态为 Submitted
    const updateData = {
      ...row,
      status: ProductionBatchStatus.Submitted.toString()
    };

    // 同时更新 batch 和 steps
    await updateProductionBatchWithSteps({
      productionBatch: updateData,
      processSteps: steps
    });

    proxy?.$modal.msgSuccess('success');
    await getList();
    await getAllList();
  } catch (error) {
    console.error('Submit error:', error);
  } finally {
    loading.value = false;
  }
};

/** 删除按钮操作 */
const handleDelete = async (row?: ProductionBatchVO) => {
  const _productionBatchIds = row?.productionBatchId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delProductionBatch(_productionBatchIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
  await getAllList();
};

/** 添加步骤按钮操作 */
const handleAddStep = () => {
  resetStep();
  stepForm.value.productionBatchId = form.value.productionBatchId;
  stepDialog.visible = true;
  stepDialog.title = 'Add Process Step';
  stepDialogAction.value = 'add';
};

/** 步骤表单重置 */
const resetStep = () => {
  stepForm.value = { ...initStepFormData };
  processStepRunFormRef.value?.resetFields();
};

/** 取消步骤按钮 */
const cancelStep = () => {
  resetStep();
  stepDialog.visible = false;
};

/** 提交步骤表单 */
const submitStepForm = () => {
  processStepRunFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      stepButtonLoading.value = true;
      try {
        if (!stepForm.value.stepRunId) {
          // 新增 step：只更新列表，不保存到数据库（会在保存 batch 时一起保存）
          if (form.value.productionBatchId) {
            stepForm.value.productionBatchId = form.value.productionBatchId;
          }
          processStepRunList.value.push({ ...stepForm.value });
        } else {
          // 编辑已有 step：只更新列表，不保存到数据库（会在保存 batch 时一起保存）
          const index = processStepRunList.value.findIndex((item) => item.stepRunId === stepForm.value.stepRunId);
          if (index !== -1) {
            processStepRunList.value[index] = { ...stepForm.value };
          }
        }
        proxy?.$modal.msgSuccess('success');
        stepDialog.visible = false;
        resetStep();
      } finally {
        stepButtonLoading.value = false;
      }
    }
  });
};

/** 编辑步骤按钮操作 */
const handleEditStep = (row: any) => {
  resetStep();
  stepForm.value = { ...row };
  stepDialog.visible = true;
  stepDialog.title = 'Edit Process Step';
  stepDialogAction.value = 'edit';
};

/** 删除步骤按钮操作 */
const handleRemoveStep = async (row: any) => {
  await proxy?.$modal.confirm('Are you sure delete this step?').finally(() => (loading.value = false));
  // 从列表中移除
  processStepRunList.value = processStepRunList.value.filter((item) => item.stepRunId !== row.stepRunId);
  proxy?.$modal.msgSuccess('success');
};

onMounted(() => {
  getList();
  getAllList();
});

const isViewFlag = (data) => {
  return (
    data.status == ProductionBatchStatus.Submitted || data.status == ProductionBatchStatus.Planned || data.status == ProductionBatchStatus.Rejected
  );
};
</script>
