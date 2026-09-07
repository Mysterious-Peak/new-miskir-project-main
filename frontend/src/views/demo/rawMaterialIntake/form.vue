<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Raw Material Intake Dialog -->
      <el-form ref="rawMaterialIntakeFormRef" :model="form" :rules="rules" label-width="200px">
        <el-form-item label="Intake ID" prop="intakeId" v-if="form.intakeId">
          <el-input v-model="form.intakeId" placeholder="Please enter Intake ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Processor ID" prop="processorId">
          <el-select
            v-model="form.processorId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input Processor ID"
            :remote-method="processorIdRemoteDialogMethod"
            :loading="processorIdLoading"
            :debounce="300"
            clearable
          >
            <el-option v-for="item in processorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="sourceBatchId">
          <template #label>
            <el-tooltip
              content="Enter a Batch ID issued by the Certification Authority. Only batches verified and approved by the central certification system can be accepted."
              placement="top"
              popper-class="source-batch-id-tooltip"
            >
              <span class="form-label-tooltip">
                <span>Post Harvest Batch Id</span>
                <el-icon class="form-label-tooltip-icon">
                  <QuestionFilled />
                </el-icon>
              </span>
            </el-tooltip>
          </template>
          <el-select
            v-model="form.sourceBatchId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="Please input"
            :remote-method="sourceBatchIdRemoteMethod"
            :loading="sourceBatchIdLoading"
            :debounce="300"
            @change="handleSourceBatchChange"
          >
            <el-option v-for="item in sourceBatchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Commodity Type" prop="commodityType">
          <el-select
            v-model="form.commodityType"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="commodityTypeRemoteMethod"
            :loading="commodityTypeLoading"
            :debounce="300"
            clearable
          >
            <el-option v-for="item in commodityTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Quantity" prop="quantity">
          <el-input-number v-model="form.quantity" placeholder="Please enter Quantity" style="width: 100%" :min="0" :max="9999999.99" />
        </el-form-item>
        <el-form-item label="Quality grade" prop="qualityGrade">
          <el-select v-model="form.qualityGrade" placeholder="Please select" clearable>
            <el-option v-for="dict in gradeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Moisture content">
          <el-input-number
            v-model="form.moistureContent"
            placeholder="Please enter Moisture content"
            :min="0"
            :max="9999999.99"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Intake date" prop="intakeDate">
          <el-date-picker
            clearable
            v-model="form.intakeDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Intake date"
          >
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="Received by" prop="receivedBy">
          <el-input v-model="form.receivedBy" placeholder="Please enter Received by" :disabled="true" />
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="RawMaterialIntakeForm" lang="ts">
import { getRawMaterialIntake, addRawMaterialIntake, updateRawMaterialIntake } from '@/api/demo/rawMaterialIntake';
import { RawMaterialIntakeForm } from '@/api/demo/rawMaterialIntake/types';
import { listPostharvestBatch, getPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listAgroprocessor } from '@/api/demo/agroprocessor';
import { getQualityInspectionByBatchId } from '@/api/demo/qualityInspectionProcess';
import { listQualityGradeMaster } from '@/api/demo/qualityGradeMaster';
import { listCropMaster } from '@/api/demo/cropMaster';
import type { AgroprocessorQuery } from '@/api/demo/agroprocessor/types';
import { QuestionFilled } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const rawMaterialIntakeFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<RawMaterialIntakeForm>({ ...initFormData });

const rules = {
  intakeId: [{ required: true, message: 'Intake ID cannot be empty', trigger: 'blur' }],
  processorId: [{ required: true, message: 'Processor ID cannot be empty', trigger: 'blur' }],
  sourceBatchId: [{ required: true, message: 'Source Batch ID cannot be empty', trigger: 'blur' }]
};

/** Load record for add/edit mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    // 新增时默认把 Received by 设置为当前登录用户
    form.value.receivedBy = Number(userStore.userId) || undefined;
    // 新建时默认给 Quality grade 设置为 "pending"
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getRawMaterialIntake(id.value);
    Object.assign(form.value, res.data);
    // Pre-populate the select options with current value
    if (form.value.sourceBatchId) {
      try {
        const batchRes = await getPostharvestBatch(form.value.sourceBatchId);
        if (batchRes.data) {
          // 预填下拉选项
          sourceBatchIdOptions.value = [
            {
              value: batchRes.data.id,
              label: `${batchRes.data.batchId}`
            }
          ];
          // 同步列表数据，便于后续根据 sourceBatchId 映射 cropCode
          sourceBatchIdList.value = [batchRes.data];
        }
      } catch (error) {
        console.error('Failed to load source batch:', error);
        // Fallback: use the sourceBatchId as label if API fails
        if (form.value.sourceBatchId) {
          sourceBatchIdOptions.value = [
            {
              value: form.value.sourceBatchId,
              label: String(form.value.sourceBatchId)
            }
          ];
        }
      }
    }
    // Pre-populate Commodity Type options if value exists
    if (form.value.commodityType) {
      try {
        const cropRes = await listCropMaster({ pageNum: 1, pageSize: 10, cropCode: form.value.commodityType });
        if (cropRes.rows && cropRes.rows.length > 0) {
          commodityTypeOptions.value = cropRes.rows.map((item) => ({
            value: item.cropCode,
            label: `${item.cropCode}`
          }));
        } else {
          // Fallback: use the commodityType as label if API returns no results
          commodityTypeOptions.value = [
            {
              value: form.value.commodityType,
              label: String(form.value.commodityType)
            }
          ];
        }
      } catch (error) {
        console.error('Failed to load commodity type:', error);
        // Fallback: use the commodityType as label if API fails
        if (form.value.commodityType) {
          commodityTypeOptions.value = [
            {
              value: form.value.commodityType,
              label: String(form.value.commodityType)
            }
          ];
        }
      }
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
  rawMaterialIntakeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (form.value.intakeId) {
          await updateRawMaterialIntake(form.value);
        } else {
          await addRawMaterialIntake(form.value);
        }
        proxy?.$modal.msgSuccess('Operation successful');
        router.push({ path: listPath.value, query: { refresh: '1' } });
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

onMounted(async () => {
  await getGradeList();
  await loadRecord();
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

.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
