<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Processing License Dialog -->
      <el-form ref="processingLicenseFormRef" :model="form" :rules="rules" label-width="180px">
        <el-form-item v-if="form.licenseId" label="License ID" prop="licenseId">
          <el-input v-model="form.licenseId" placeholder="Please input" clearable :disabled="true" />
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
            :disabled="true"
          >
            <el-option v-for="item in processorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="License Type" prop="licenseType">
          <el-select v-model="form.licenseType" placeholder="Please select License Type" clearable :disabled="true">
            <el-option v-for="dict in license_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Issuing Authority" prop="issuingAuthority">
          <el-select v-model="form.issuingAuthority" placeholder="Please select Issuing Authority" clearable :disabled="true">
            <el-option v-for="dict in issuing_authority" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Issue Date" prop="issueDate">
          <el-date-picker
            clearable
            v-model="form.issueDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Issue Date"
            :disabled="true"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Expire Date" prop="expireDate">
          <el-date-picker
            clearable
            v-model="form.expireDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Expire Date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Status" prop="validityStatus">
          <el-select v-model="form.validityStatus" placeholder="Please select Validity Status" clearable>
            <el-option v-for="dict in license_all_status" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Document URL" prop="documentUrl">
          <el-input v-model="form.documentUrl" placeholder="Please input" clearable />
        </el-form-item>
        <!-- <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input Approval Comment" :disabled="isViewMode" />
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="handleApprove">Save</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ProcessingLicenseRenewalForm" lang="ts">
import { getProcessingLicense, updateProcessingLicense } from '@/api/demo/processingLicense';
import { ProcessingLicenseForm } from '@/api/demo/processingLicense/types';
import { listAgroprocessor } from '@/api/demo/agroprocessor';
import type { AgroprocessorQuery } from '@/api/demo/agroprocessor/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { license_type, issuing_authority, license_all_status } = toRefs<any>(
  proxy?.useDict('license_type', 'issuing_authority', 'license_all_status')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const processingLicenseFormRef = ref<ElFormInstance>();

const isRenew = computed(() => route.path.endsWith('/renew') || route.path.includes('/renew/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: ProcessingLicenseForm = {
  licenseId: undefined,
  processorId: undefined,
  licenseType: undefined,
  issuingAuthority: undefined,
  issueDate: undefined,
  expireDate: undefined,
  status: undefined,
  validityStatus: undefined,
  documentUrl: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};

const form = ref<ProcessingLicenseForm>({ ...initFormData });

const rules = {
  licenseId: [{ required: true, message: 'License ID cannot be empty', trigger: 'blur' }],
  processorId: [{ required: true, message: 'Processor ID cannot be empty', trigger: 'blur' }],
  licenseType: [{ required: true, message: 'License Type cannot be empty', trigger: 'change' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
};

// Processor ID remote search options
const processorIdOptions = ref<{ label: string; value: string | number }[]>([]);
const processorIdLoading = ref(false);

/** Processor ID remote search method for dialog */
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

/** Load record for renew mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getProcessingLicense(id.value);
    Object.assign(form.value, res.data);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Approval button: set status to validityStatus */
const handleApprove = () => {
  processingLicenseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (!form.value.licenseId) {
          proxy?.$modal.msgError('License ID cannot be empty');
          return;
        }
        form.value.status = form.value.validityStatus;
        await updateProcessingLicense(form.value).finally(() => (buttonLoading.value = false));
        proxy?.$modal.msgSuccess('Approval successful');
        router.push({ path: listPath.value, query: { refresh: '1' } });
      } catch (error) {
        console.error('Failed to approve processing license:', error);
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
