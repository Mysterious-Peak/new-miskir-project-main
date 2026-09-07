<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
            <el-form-item label="Provider ID" prop="providerId">
              <el-select
                v-model="queryParams.providerId"
                filterable
                remote
                reserve-keyword
                clearable
                placeholder="Please input"
                :remote-method="queryProviderIdRemoteMethod"
                :loading="queryProviderIdLoading"
                :debounce="300"
              >
                <el-option v-for="item in queryProviderIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Provider business name" prop="providerName">
              <el-input prefix-icon="Search" v-model="queryParams.providerName" placeholder="Please enter Provider business name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Transport license number" prop="licenseNumber">
              <el-input
                v-model="queryParams.licenseNumber"
                placeholder="Please enter Transport license number"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <!-- <el-form-item label="Number of vehicles in fleet" prop="fleetSize">
              <el-input v-model="queryParams.fleetSize" placeholder="请输入Number of vehicles in fleet" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Operating region" prop="region">
              <el-input v-model="queryParams.region" placeholder="请输入Operating region" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approving authority user ID" prop="approvedBy">
              <el-input v-model="queryParams.approvedBy" placeholder="请输入Approving authority user ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approval Comment" prop="approvedComment">
              <el-input v-model="queryParams.approvedComment" placeholder="Please enter Approval Comment" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approval date" prop="approvedAt">
              <el-date-picker clearable
                v-model="queryParams.approvedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Approval date"
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
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:logisticsProvider:add']">Add</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:logisticsProvider:edit']"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:logisticsProvider:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:logisticsProvider:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="logisticsProviderList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Provider ID" align="center" prop="providerId" v-if="true" :min-width="getColumnWidth('Provider ID')" />
        <el-table-column label="Provider business name" align="center" prop="providerName" :min-width="getColumnWidth('Provider business name')" />
        <el-table-column
          label="Transport license number"
          align="center"
          prop="licenseNumber"
          :min-width="getColumnWidth('Transport license number')"
        />
        <el-table-column
          label="Number of vehicles in fleet"
          align="center"
          prop="fleetSize"
          :min-width="getColumnWidth('Number of vehicles in fleet')"
        />
        <el-table-column label="Operating region" align="center" prop="region" :min-width="getColumnWidth('Operating region')">
          <template #default="scope">
            <dict-tag :options="region" :value="scope.row.region" />
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ logisticsProviderStatus[scope.row.status as logisticsProviderStatus] }}</el-tag>
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
        <el-table-column label="Approved Date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" :width="actionColumnWidth">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <template v-else>
              <el-button
                class="table-action-btn table-edit-btn"
                icon="EditPen"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['demo:logisticsProvider:edit']"
                >Edit</el-button
              >
              <el-button
                class="table-action-btn table-delete-btn"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['demo:logisticsProvider:remove']"
                >Delete</el-button
              >
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Logistics Provider Dialog -->
  </div>
</template>

<script setup name="LogisticsProvider" lang="ts">
import {
  listLogisticsProvider,
  autoCompleteLogisticsProviderExistingProviderId,
  getLogisticsProvider,
  delLogisticsProvider,
  addLogisticsProvider,
  updateLogisticsProvider
} from '@/api/demo/logisticsProvider';
import { LogisticsProviderVO, LogisticsProviderQuery, LogisticsProviderForm } from '@/api/demo/logisticsProvider/types';
import { logisticsProviderStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { region } = toRefs<any>(proxy?.useDict('region'));

const logisticsProviderList = ref<LogisticsProviderVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const actionColumnWidth = computed(() => {
  const hasTwoButtons = logisticsProviderList.value.some((row) => !isViewFlag(row));
  return hasTwoButtons ? 210 : 110;
});

const queryFormRef = ref<ElFormInstance>();
const logisticsProviderFormRef = ref<ElFormInstance>();

const queryProviderIdLoading = ref(false);
const queryProviderIdOptions = ref<{ label: string; value: string | number }[]>([]);
const queryProviderIdList = ref<any[]>([]);

const queryProviderIdRemoteMethod = async (query: string) => {
  if (query) {
    queryProviderIdLoading.value = true;
    try {
      const res = await autoCompleteLogisticsProviderExistingProviderId({
        providerId: query?.trim(),
        pageNum: null,
        pageSize: null
      } as any);
      queryProviderIdList.value = (res as any).data || (res as any).rows || [];
      queryProviderIdOptions.value = queryProviderIdList.value.map((item: any) => ({
        value: item.providerId,
        label: String(item.providerId)
      }));
    } finally {
      queryProviderIdLoading.value = false;
    }
  } else {
    queryProviderIdOptions.value = [];
  }
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LogisticsProviderForm = {
  providerId: undefined,
  providerName: undefined,
  licenseNumber: undefined,
  fleetSize: undefined,
  region: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};
const data = reactive<PageData<LogisticsProviderForm, LogisticsProviderQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    providerId: undefined,
    providerName: undefined,
    licenseNumber: undefined,
    fleetSize: undefined,
    region: undefined,
    status: undefined,
    approvedBy: undefined,
    approvedComment: undefined,
    approvedAt: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    providerId: [{ required: true, message: 'Unique provider identifier cannot be empty', trigger: 'blur' }],
    providerName: [{ required: true, message: 'Provider business name cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Draft=0 / Approved=1 cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Logistics Provider List */
const getList = async () => {
  loading.value = true;
  const res = await listLogisticsProvider(queryParams.value);
  logisticsProviderList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  logisticsProviderFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: LogisticsProviderVO[]) => {
  ids.value = selection.map((item) => item.providerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'LogisticsProviderAdd' });
};

/** Edit / View Button Action */
const handleUpdate = (row?: LogisticsProviderVO) => {
  const current: any = row || {};
  const _providerId = current.providerId || ids.value[0];
  if (isViewFlag(current)) {
    router.push({ name: 'LogisticsProviderDetail', params: { id: _providerId } });
  } else {
    router.push({ name: 'LogisticsProviderEdit', params: { id: _providerId } });
  }
};

/** Submit Button */
const submitForm = () => {
  logisticsProviderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = logisticsProviderStatus.Draft.toString();
      if (form.value.providerId) {
        await updateLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLogisticsProvider(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: LogisticsProviderVO) => {
  const _providerIds = row?.providerId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure you want to delete the logistics provider with ID "' + _providerIds + '"?')
    .finally(() => (loading.value = false));
  await delLogisticsProvider(_providerIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/logisticsProvider/export',
    {
      ...queryParams.value
    },
    `logisticsProvider_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

const isViewFlag = (data) => {
  return data.status == logisticsProviderStatus.Rejected.toString() || data.status == logisticsProviderStatus.Approved.toString();
};
</script>
