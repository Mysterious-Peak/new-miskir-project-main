<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Processor ID" prop="processorId">
              <el-select
                v-model="queryParams.processorId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input Processor ID"
                :remote-method="processorIdRemoteMethod"
                :loading="processorIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in processorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Source Batch ID" prop="sourceBatchId">
              <el-select
                v-model="queryParams.sourceBatchId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="sourceBatchIdQueryRemoteMethod"
                :loading="sourceBatchIdQueryLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in sourceBatchIdQueryOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Quantity (e.g. kg)" prop="quantity">
              <el-input v-model="queryParams.quantity" placeholder="Please enter Quantity (e.g. kg)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Quality grade" prop="qualityGrade">
              <el-input v-model="queryParams.qualityGrade" placeholder="Please enter Quality grade" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Intake date" prop="intakeDate">
              <el-date-picker clearable
                v-model="queryParams.intakeDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Intake date"
              />
            </el-form-item>
            <el-form-item label="Received by user ID (FK → USER)" prop="receivedBy">
              <el-input v-model="queryParams.receivedBy" placeholder="Please enter Received by user ID (FK → USER)" clearable @keyup.enter="handleQuery" />
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
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:rawMaterialIntake:add']">Add</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:rawMaterialIntake:edit']"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:rawMaterialIntake:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:rawMaterialIntake:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="rawMaterialIntakeList" @selection-change="handleSelectionChange" stripe fit border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Intake ID" align="center" prop="intakeId" v-if="true" :min-width="getColumnWidth('Intake ID')" />
        <el-table-column label="Processor ID" align="center" prop="processorId" :min-width="getColumnWidth('Processor ID')" />
        <el-table-column label="Source Batch ID" align="center" prop="sourceBatchId" :min-width="getColumnWidth('Source Batch ID')" />
        <el-table-column label="Commodity type" align="center" prop="commodityType" :min-width="getColumnWidth('Commodity type')" />
        <el-table-column label="Quantity" align="center" prop="quantity" :min-width="getColumnWidth('Quantity')" />
        <el-table-column label="Quality grade" align="center" prop="qualityGrade" :min-width="getColumnWidth('Quality grade')" />
        <el-table-column label="Moisture content" align="center" prop="moistureContent" :min-width="getColumnWidth('Moisture content')" />
        <el-table-column label="Intake date" align="center" prop="intakeDate" :min-width="getColumnWidth('Intake date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.intakeDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Received by" align="center" prop="receivedBy" :min-width="getColumnWidth('Received by')" />
        <el-table-column label="Actions" align="center" width="210" fixed="right" class-name="action-column">
          <template #default="scope">
            <el-button
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['demo:rawMaterialIntake:edit']"
              >Edit</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:rawMaterialIntake:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Raw Material Intake Dialog -->
  </div>
</template>

<script setup name="RawMaterialIntake" lang="ts">
import {
  listRawMaterialIntake,
  getRawMaterialIntake,
  delRawMaterialIntake,
  addRawMaterialIntake,
  updateRawMaterialIntake
} from '@/api/demo/rawMaterialIntake';
import { RawMaterialIntakeVO, RawMaterialIntakeQuery, RawMaterialIntakeForm } from '@/api/demo/rawMaterialIntake/types';
import { listPostharvestBatch, getPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listAgroprocessor } from '@/api/demo/agroprocessor';
import { getQualityInspection } from '@/api/demo/qualityInspection';
import { getQualityInspectionByBatchId } from '@/api/demo/qualityInspectionProcess';
import { listQualityGradeMaster } from '@/api/demo/qualityGradeMaster';
import { listCropMaster } from '@/api/demo/cropMaster';
import type { AgroprocessorQuery } from '@/api/demo/agroprocessor/types';
import { QuestionFilled } from '@element-plus/icons-vue';
import { getColumnWidth } from '@/utils/utils';
import { parseTime } from '@/utils/ruoyi';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const rawMaterialIntakeList = ref<RawMaterialIntakeVO[]>([]);
const rawMaterialIntakeAllList = ref<RawMaterialIntakeVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const rawMaterialIntakeFormRef = ref<ElFormInstance>();

// Source Batch ID remote search
const sourceBatchIdOptions = ref<{ label: string; value: string | number }[]>([]);
const sourceBatchIdList = ref<any[]>([]);
const sourceBatchIdLoading = ref(false);
const sourceBatchIdRemoteMethod = async (query: string) => {
  if (query) {
    sourceBatchIdLoading.value = true;
    try {
      const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query });
      sourceBatchIdList.value = res.rows;
      sourceBatchIdOptions.value = res.rows.map((item) => ({
        value: item.id,
        label: `${item.batchId}`
      }));
    } finally {
      sourceBatchIdLoading.value = false;
    }
  } else {
    sourceBatchIdOptions.value = [];
  }
};

/** 选择 Source Batch 后：
 * 1）根据返回数据自动填充 Commodity Type（使用 cropCode）
 * 2）再根据 batch 的 id 调用 getQualityInspection，填充 Quality grade（gradeCode）和 Moisture content（moisturePct）
 */
const handleSourceBatchChange = async (value: string | number) => {
  if (!value) {
    form.value.commodityType = undefined;
    form.value.qualityGrade = undefined;
    form.value.moistureContent = undefined;
    return;
  }

  const batch = sourceBatchIdList.value.find((item: any) => String(item.id) === String(value));
  if (batch) {
    // 1）先填充 Commodity Type = cropCode
    if (batch.cropCode) {
      form.value.commodityType = batch.cropCode;
    }

    // 2）根据 batch.id 调用 getQualityInspectionByBatchId 查询 gradeCode / moisturePct
    try {
      // 确保 gradeOptions 已加载
      if (gradeOptions.value.length === 0) {
        await getGradeList();
      }

      const detailRes = await getQualityInspectionByBatchId(batch.batchId);
      const detail: any = detailRes.data || detailRes;
      if (detail) {
        // gradeCode → Quality grade
        // 确保值在下拉框选项中存在，并转换为字符串以匹配选项值
        if (detail.gradeCode !== undefined && detail.gradeCode !== null) {
          const gradeCodeValue = String(detail.gradeCode);
          // 检查该值是否在下拉框选项中
          const existsInOptions = gradeOptions.value.some((option) => String(option.value) === gradeCodeValue);
          if (existsInOptions) {
            form.value.qualityGrade = gradeCodeValue;
          } else {
            // 如果不在选项中，仍然赋值（可能选项还未完全加载）
            form.value.qualityGrade = gradeCodeValue;
          }
        }
        // moisturePct → Moisture content
        if (detail.moisturePct !== undefined && detail.moisturePct !== null) {
          form.value.moistureContent = detail.moisturePct;
        }
      }
    } catch (error) {
      console.error('Failed to load quality inspection info from batch:', error);
    }
  }
};

// Processor ID remote search
const processorIdOptions = ref<{ label: string; value: string | number }[]>([]);
const processorIdLoading = ref(false);

// Quality Grade options
const gradeOptions = ref<{ label: string; value: string | number }[]>([]);
const getGradeList = async () => {
  try {
    const res = await listQualityGradeMaster({ pageNum: 1, pageSize: 1000 });
    gradeOptions.value = res.rows.map((item) => ({
      value: item.gradeCode,
      label: `${item.gradeCode}`
    }));
  } catch (error) {
    console.error('Failed to load quality grade list:', error);
    gradeOptions.value = [];
  }
};

// Commodity Type options (参考 croppingPlan/index.vue)
const commodityTypeOptions = ref<{ label: string; value: string | number }[]>([]);
const commodityTypeList = ref<any[]>([]);
const commodityTypeLoading = ref(false);
const commodityTypeRemoteMethod = async (query: string) => {
  if (query) {
    commodityTypeLoading.value = true;
    try {
      const res = await listCropMaster({ pageNum: 1, pageSize: 10, cropCode: query });
      commodityTypeList.value = res.rows;
      commodityTypeOptions.value = res.rows.map((item) => ({
        value: item.cropCode,
        label: `${item.cropCode}`
      }));
    } catch (error) {
      console.error('Failed to search Commodity Type:', error);
      commodityTypeOptions.value = [];
    } finally {
      commodityTypeLoading.value = false;
    }
  } else {
    commodityTypeOptions.value = [];
  }
};

const processorIdRemoteDialogMethod = async (query: string) => {
  if (query) {
    processorIdLoading.value = true;
    try {
      const res = await listAgroprocessor({ processorId: query, pageNum: 1, pageSize: 10 } as AgroprocessorQuery);
      const rows = res.rows || [];
      const filteredRows = rows.filter((item: any) => item.status === '1');
      const uniqueIds = [...new Set(filteredRows.map((item: any) => item.processorId))];
      processorIdOptions.value = uniqueIds.map((id) => ({
        value: id,
        label: id
      }));
    } catch (error) {
      console.error('Failed to search Processor ID:', error);
      processorIdOptions.value = [];
    } finally {
      processorIdLoading.value = false;
    }
  } else {
    processorIdOptions.value = [];
  }
};

// Processor ID remote search (for query form) - 从本页面数据中过滤
const processorIdRemoteMethod = async (query: string) => {
  if (query) {
    processorIdLoading.value = true;
    try {
      // 参考 productionBatch/index.vue，从本页面的所有数据中过滤
      const uniqueIds = [
        ...new Set(
          rawMaterialIntakeAllList.value
            .filter((f) => f.processorId && f.processorId.toString().toLowerCase().includes(query.toLowerCase()))
            .map((item) => item.processorId)
        )
      ];
      processorIdOptions.value = uniqueIds.map((id) => ({
        value: id,
        label: String(id)
      }));
    } catch (error) {
      console.error('Failed to search Processor ID:', error);
      processorIdOptions.value = [];
    } finally {
      processorIdLoading.value = false;
    }
  } else {
    processorIdOptions.value = [];
  }
};

// Source Batch ID remote search (for query form) - 从本页面数据中过滤
const sourceBatchIdQueryOptions = ref<{ label: string; value: string | number }[]>([]);
const sourceBatchIdQueryLoading = ref(false);
const sourceBatchIdQueryRemoteMethod = async (query: string) => {
  if (query) {
    sourceBatchIdQueryLoading.value = true;
    try {
      // 从本页面的所有数据中过滤 Source Batch ID
      const uniqueIds = [
        ...new Set(
          rawMaterialIntakeAllList.value
            .filter((f) => f.sourceBatchId && f.sourceBatchId.toString().toLowerCase().includes(query.toLowerCase()))
            .map((item) => item.sourceBatchId)
        )
      ];
      sourceBatchIdQueryOptions.value = uniqueIds.map((id) => ({
        value: id,
        label: String(id)
      }));
    } catch (error) {
      console.error('Failed to search Source Batch ID:', error);
      sourceBatchIdQueryOptions.value = [];
    } finally {
      sourceBatchIdQueryLoading.value = false;
    }
  } else {
    sourceBatchIdQueryOptions.value = [];
  }
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RawMaterialIntakeForm = {
  intakeId: undefined,
  processorId: undefined,
  sourceBatchId: undefined,
  commodityType: undefined,
  quantity: undefined,
  qualityGrade: undefined,
  moistureContent: undefined,
  intakeDate: undefined,
  // 默认使用当前登录用户作为 Received by
  receivedBy: undefined
};
const data = reactive<PageData<RawMaterialIntakeForm, RawMaterialIntakeQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    processorId: undefined,
    sourceBatchId: undefined,
    commodityType: undefined,
    quantity: undefined,
    qualityGrade: undefined,
    moistureContent: undefined,
    intakeDate: undefined,
    receivedBy: undefined,
    params: {}
  },
  rules: {
    intakeId: [{ required: true, message: 'Intake ID cannot be empty', trigger: 'blur' }],
    processorId: [{ required: true, message: 'Processor ID cannot be empty', trigger: 'blur' }],
    sourceBatchId: [{ required: true, message: 'Source Batch ID cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Raw Material Intake List */
const getList = async () => {
  loading.value = true;
  const res = await listRawMaterialIntake(queryParams.value);
  rawMaterialIntakeList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** Load All Raw Material Intake List (for dropdown options) */
const getAllList = async () => {
  try {
    const res = await listRawMaterialIntake({ pageNum: 1, pageSize: 10000 });
    rawMaterialIntakeAllList.value = res.rows || [];
  } catch (error) {
    console.error('Failed to load all raw material intake list:', error);
    rawMaterialIntakeAllList.value = [];
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
  rawMaterialIntakeFormRef.value?.resetFields();
  sourceBatchIdOptions.value = [];
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

/** Multi-select Selected Data */
const handleSelectionChange = (selection: RawMaterialIntakeVO[]) => {
  ids.value = selection.map((item) => item.intakeId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'RawMaterialIntakeAdd' });
};

/** Edit Button Action */
const handleUpdate = (row?: RawMaterialIntakeVO) => {
  const _intakeId = row?.intakeId || ids.value[0];
  router.push({ name: 'RawMaterialIntakeEdit', params: { id: _intakeId } });
};

/** Submit Button */
const submitForm = () => {
  rawMaterialIntakeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.intakeId) {
        await updateRawMaterialIntake(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addRawMaterialIntake(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: RawMaterialIntakeVO) => {
  const _intakeIds = row?.intakeId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure you want to delete the raw material intake record with ID "' + _intakeIds + '"?')
    .finally(() => (loading.value = false));
  await delRawMaterialIntake(_intakeIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/rawMaterialIntake/export',
    {
      ...queryParams.value
    },
    `rawMaterialIntake_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
  getAllList();
  getGradeList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

<style>
.form-label-tooltip {
  display: inline-flex;
  align-items: center;
  cursor: help;
}

.form-label-tooltip-icon {
  margin-left: 4px;
  color: #909399;
  font-size: 20px !important;
}

.source-batch-id-tooltip {
  max-width: 360px !important;
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}
</style>
