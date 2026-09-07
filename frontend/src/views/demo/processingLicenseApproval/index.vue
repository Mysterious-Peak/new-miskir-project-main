<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="License ID" prop="licenseId">
              <el-select
                v-model="queryParams.licenseId"
                filterable
                remote
                reserve-keyword
                clearable
                placeholder="Please input"
                :remote-method="queryLicenseIdRemoteMethod"
                :loading="queryLicenseIdLoading"
                :debounce="300"
              >
                <el-option v-for="item in queryLicenseIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
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
            <el-form-item label="License Type" prop="licenseType">
              <el-select v-model="queryParams.licenseType" placeholder="Please select License Type" clearable>
                <el-option v-for="dict in license_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Issue Date" prop="issueDate">
              <el-date-picker clearable
                v-model="queryParams.issueDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Issue Date"
              />
            </el-form-item>
            <el-form-item label="Expire Date" prop="expireDate">
              <el-date-picker clearable
                v-model="queryParams.expireDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Expire Date"
              />
            </el-form-item>
            <el-form-item label="Approved By" prop="approvedBy">
              <el-input
                v-model="queryParams.approvedBy"
                placeholder="Please input Approved By"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Approval Comment" prop="approvedComment">
              <el-input
                v-model="queryParams.approvedComment"
                placeholder="Please input Approval Comment"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Approval Time" prop="approvedAt">
              <el-date-picker clearable
                v-model="queryParams.approvedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Approval Time"
              />
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:processingLicense:add']">Add</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:processingLicense:edit']">
              Edit
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:processingLicense:remove']">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:processingLicense:export']"> Export </el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="processingLicenseList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="License ID" align="center" prop="licenseId" v-if="true" :min-width="getColumnWidth('License ID')" />
        <el-table-column label="Processor ID" align="center" prop="processorId" :min-width="getColumnWidth('Processor ID')" />
        <el-table-column label="license Type" align="center" prop="licenseType" :min-width="getColumnWidth('license Type')" width="120px">
          <template #default="scope">
            <dict-tag :options="license_type" :value="scope.row.licenseType" />
          </template>
        </el-table-column>
        <el-table-column
          label="Issuing Authority"
          align="center"
          prop="issuingAuthority"
          :min-width="getColumnWidth('Issuing Authority')"
          width="120px"
        >
          <template #default="scope">
            <dict-tag :options="issuing_authority" :value="scope.row.issuingAuthority" />
          </template>
        </el-table-column>
        <el-table-column label="Issue Date" align="center" prop="issueDate" width="180" :min-width="getColumnWidth('Issue Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.issueDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Expire Date" align="center" prop="expireDate" width="180" :min-width="getColumnWidth('Expire Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expireDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="Validity Status" align="center" prop="validityStatus" :min-width="getColumnWidth('Validity Status')">
          <template #default="scope">
            <dict-tag :options="license_all_status" :value="scope.row.validityStatus" />
          </template>
        </el-table-column> -->
        <el-table-column label="Document URL" prop="documentUrl" align="center" :min-width="getColumnWidth('Document URL')">
          <template #default="scope">
            <el-link v-if="scope.row.documentUrl" :href="scope.row.documentUrl" type="primary" target="_blank">View</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')" width="120px">
          <template #default="scope">
            <el-tag>{{ processingLicenseStatus[scope.row.status as processingLicenseStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
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
        <el-table-column label="Actions" align="center" fixed="right" width="110" class-name="action-column">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === String(processingLicenseStatus.Submitted)"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="router.push({ name: 'ProcessingLicenseApprovalApprove', params: { id: scope.row.licenseId } })"
              v-hasPermi="['demo:processingLicense:edit']"
              >Edit</el-button
            >
            <el-button
              v-else
              class="table-action-btn table-check-btn"
              icon="View"
              @click="router.push({ name: 'ProcessingLicenseApprovalDetail', params: { id: scope.row.licenseId } })"
              >View</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Processing License Dialog -->
  </div>
</template>

<script setup name="ProcessingLicense" lang="ts">
import {
  listProcessingLicense,
  autoCompleteProcessingLicenseExistingLicenseId,
  getProcessingLicense,
  delProcessingLicense,
  addProcessingLicense,
  updateProcessingLicense
} from '@/api/demo/processingLicense';
import { ProcessingLicenseVO, ProcessingLicenseQuery, ProcessingLicenseForm } from '@/api/demo/processingLicense/types';
import { listAgroprocessor } from '@/api/demo/agroprocessor';
import type { AgroprocessorQuery } from '@/api/demo/agroprocessor/types';
import { getColumnWidth } from '@/utils/utils';
import { parseTime } from '@/utils/ruoyi';
import { processingLicenseStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { license_type, issuing_authority, license_all_status } = toRefs<any>(
  proxy?.useDict('license_type', 'issuing_authority', 'license_all_status')
);

const processingLicenseList = ref<ProcessingLicenseVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryLicenseIdLoading = ref(false);
const queryLicenseIdOptions = ref<{ label: string; value: string | number }[]>([]);
const queryLicenseIdList = ref<any[]>([]);

const queryLicenseIdRemoteMethod = async (query: string) => {
  if (query) {
    queryLicenseIdLoading.value = true;
    try {
      const res = await autoCompleteProcessingLicenseExistingLicenseId({
        licenseId: query?.trim(),
        pageNum: null,
        pageSize: null
      } as any);
      queryLicenseIdList.value = (res as any).data || (res as any).rows || [];
      queryLicenseIdOptions.value = queryLicenseIdList.value.map((item: any) => ({
        value: item.licenseId,
        label: String(item.licenseId)
      }));
    } finally {
      queryLicenseIdLoading.value = false;
    }
  } else {
    queryLicenseIdOptions.value = [];
  }
};

// Processor ID remote search options
const processorIdOptions = ref<{ label: string; value: string | number }[]>([]);
const processorIdLoading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const processingLicenseFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const isViewMode = ref(false);

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
const data = reactive<PageData<ProcessingLicenseForm, ProcessingLicenseQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
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
    approvedAt: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    licenseId: [{ required: true, message: 'License ID cannot be empty', trigger: 'blur' }],
    processorId: [{ required: true, message: 'Processor ID cannot be empty', trigger: 'blur' }],
    licenseType: [{ required: true, message: 'License Type cannot be empty', trigger: 'change' }],
    status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query processing license list */
const getList = async () => {
  loading.value = true;
  try {
    const lid = queryParams.value.licenseId;
    if (lid !== undefined && lid !== null && String(lid).trim() !== '') {
      try {
        const res = await getProcessingLicense(lid);
        const row = (res as any).data ?? (res as any);
        if (row && row.licenseId != null) {
          processingLicenseList.value = [row];
          total.value = 1;
        } else {
          processingLicenseList.value = [];
          total.value = 0;
        }
      } catch {
        processingLicenseList.value = [];
        total.value = 0;
      }
    } else {
      const res = await listProcessingLicense(queryParams.value);
      processingLicenseList.value = res.rows;
      total.value = res.total;
    }
  } finally {
    loading.value = false;
  }
};

/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Reset form */
const reset = () => {
  form.value = { ...initFormData };
  processingLicenseFormRef.value?.resetFields();
  isViewMode.value = false;
};

/** Search button */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset button */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** Selection change */
const handleSelectionChange = (selection: ProcessingLicenseVO[]) => {
  ids.value = selection.map((item) => item.licenseId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add button */
const handleAdd = () => {
  reset();
  isViewMode.value = false;
  dialog.visible = true;
  dialog.title = 'Add Processing License';
};

/** View button */
const handleView = async (row?: ProcessingLicenseVO) => {
  reset();
  isViewMode.value = true;
  const _licenseId = row?.licenseId || ids.value[0];
  const res = await getProcessingLicense(_licenseId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'View Processing License';
};

/** Edit button */
const handleUpdate = async (row?: ProcessingLicenseVO) => {
  reset();
  isViewMode.value = false;
  const _licenseId = row?.licenseId || ids.value[0];
  const res = await getProcessingLicense(_licenseId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Approval Processing License';
};

/** Approval button: set status to Approved */
const handleApprove = () => {
  processingLicenseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (!form.value.licenseId) {
          proxy?.$modal.msgError('License ID cannot be empty');
          return;
        }
        form.value.status = processingLicenseStatus.Approved.toString();
        await updateProcessingLicense(form.value).finally(() => (buttonLoading.value = false));
        proxy?.$modal.msgSuccess('Approval successful');
        dialog.visible = false;
        await getList();
      } catch (error) {
        console.error('Failed to approve processing license:', error);
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** Reject button: set status to Rejected */
const handleReject = () => {
  processingLicenseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (!form.value.licenseId) {
          proxy?.$modal.msgError('License ID cannot be empty');
          return;
        }
        form.value.status = processingLicenseStatus.Rejected.toString();
        await updateProcessingLicense(form.value).finally(() => (buttonLoading.value = false));
        proxy?.$modal.msgSuccess('Reject successful');
        dialog.visible = false;
        await getList();
      } catch (error) {
        console.error('Failed to reject processing license:', error);
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** Need Revision button: set status to NeedRevision */
const handleNeedRevision = () => {
  processingLicenseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (!form.value.licenseId) {
          proxy?.$modal.msgError('License ID cannot be empty');
          return;
        }
        form.value.status = processingLicenseStatus.NeedRevision.toString();
        await updateProcessingLicense(form.value).finally(() => (buttonLoading.value = false));
        proxy?.$modal.msgSuccess('Need Revision successful');
        dialog.visible = false;
        await getList();
      } catch (error) {
        console.error('Failed to set need revision for processing license:', error);
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** Delete button */
const handleDelete = async (row?: ProcessingLicenseVO) => {
  const _licenseIds = row?.licenseId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure you want to delete processing license with ID "' + _licenseIds + '"?')
    .finally(() => (loading.value = false));
  await delProcessingLicense(_licenseIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export button */
const handleExport = () => {
  proxy?.download(
    'demo/processingLicense/export',
    {
      ...queryParams.value
    },
    `processingLicense_${new Date().getTime()}.xlsx`
  );
};

/** Processor ID remote search method for query form (search area)
 *  从当前页面已有的 processingLicenseList 中筛选 Processor ID，而不是查询所有加工企业
 */
const processorIdRemoteMethod = async (query: string) => {
  if (query) {
    processorIdLoading.value = true;
    try {
      const lower = query.toLowerCase();
      const uniqueIds = [
        ...new Set(
          processingLicenseList.value
            .filter((item) => item.processorId && item.processorId.toString().toLowerCase().includes(lower))
            .map((item) => item.processorId as string | number)
        )
      ];
      processorIdOptions.value = uniqueIds.map((id: string | number) => ({
        value: id,
        label: String(id)
      }));
    } catch (error) {
      console.error('Failed to search Processor ID (query form):', error);
      processorIdOptions.value = [];
    } finally {
      processorIdLoading.value = false;
    }
  } else {
    processorIdOptions.value = [];
  }
};

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

onMounted(() => {
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>
