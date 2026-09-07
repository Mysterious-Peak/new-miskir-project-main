<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="FarmLand ID" prop="id">
              <el-select
                v-model="queryParams.id"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmLandIdRemoteMethod"
                :loading="farmLandIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in farmLandIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Farmer ID" prop="farmerId">
              <!-- <el-input v-model="queryParams.farmerId" placeholder="Please input Farmer ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.farmerId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmerIdRemoteMethod"
                :loading="farmerIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in farmerIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Kebele ID" prop="kebeleId">
              <el-input prefix-icon="Search" v-model="queryParams.kebeleId" placeholder="Please input Kebele ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Approval</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" >导出</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="farmlandList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="FarmLand ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('FarmLand ID')" />
        <el-table-column label="Farmer ID" align="center" prop="farmerId" :min-width="getColumnWidth('Farmer ID')" />
        <el-table-column label="Kebele ID" align="center" prop="kebeleId" :min-width="getColumnWidth('Kebele ID')" />
        <el-table-column label="Latitude" align="center" prop="gpsLat" :min-width="getColumnWidth('Latitude')" />
        <el-table-column label="Longitude" align="center" prop="gpsLong" :min-width="getColumnWidth('Longitude')" />
        <!-- <el-table-column label="Polygon" align="center" prop="gpsPolygon" /> -->
        <el-table-column label="Area(ha)" align="center" prop="areaTa" :min-width="getColumnWidth('Area(ha)')" />
        <el-table-column label="Soil Type" align="center" prop="soilCode" :min-width="getColumnWidth('Soil Type')">
          <template #default="scope">
            <span>{{ getSoilNameByCode(scope.row.soilCode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Irrigation Type" align="center" prop="irrigationCode" :min-width="getColumnWidth('Irrigation Type')">
          <template #default="scope">
            <span>{{ getIrrigationNameByCode(scope.row.irrigationCode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Slope Class" align="center" prop="slopeClass" :min-width="getColumnWidth('Slope Class')">
          <template #default="scope">
            <dict-tag :options="slope_class" :value="scope.row.slopeClass" />
          </template>
        </el-table-column>
        <el-table-column label="Land Use Type" align="center" prop="landUseType" :min-width="getColumnWidth('Land Use Type')">
          <template #default="scope">
            <dict-tag :options="land_use_type" :value="scope.row.landUseType" />
          </template>
        </el-table-column>
        <el-table-column label="Altitude(m)" align="center" prop="elevationM" :min-width="getColumnWidth('Altitude(m)')" />
        <el-table-column label="Land Ownership Type" align="center" prop="landOwnershipType" :min-width="getColumnWidth('Land Ownership Type')">
          <template #default="scope">
            <dict-tag :options="land_ownership_type" :value="scope.row.landOwnershipType" />
          </template>
        </el-table-column>
        <el-table-column label="Aspect / Slope Direction" align="center" prop="slopeAspect" :min-width="getColumnWidth('Aspect / Slope Direction')">
          <template #default="scope">
            <dict-tag :options="slope_aspect" :value="scope.row.slopeAspect" />
          </template>
        </el-table-column>
        <el-table-column label="Sampling depth" align="center" prop="samplingDepth" :min-width="getColumnWidth('Sampling depth')">
          <template #default="scope">
            <dict-tag :options="sampling_depth" :value="scope.row.samplingDepth" />
          </template>
        </el-table-column>
        <el-table-column label="Land use history" align="center" prop="landUseRecord" :min-width="getColumnWidth('Land use history')">
          <template #default="scope">
            <dict-tag :options="land_use_record" :value="scope.row.landUseRecord" />
          </template>
        </el-table-column>
        <el-table-column label="Accessibility to infrastructure" align="center" prop="infrastructureAccessibility" :min-width="getColumnWidth('Accessibility to infrastructure')" show-overflow-tooltip />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Created Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Created Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedTime" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" :min-width="getColumnWidth('Approval Comment')" />
        <!-- <el-table-column label="Remark" align="center" prop="remark" /> -->
        <!-- <el-table-column label="批准人" align="center" prop="approvedBy" />
        <el-table-column label="批准时间" align="center" prop="approvedTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="拒绝原因" align="center" prop="rejectionReason" />
        <el-table-column label="创建者(DA)" align="center" prop="daCreateBy" />-->
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              link
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleUpdate(scope.row)"
              v-if="scope.row.status != ApprovalStatus.Draft.toString()"
              >View</el-button
            >
            <el-button
              link
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-if="scope.row.status == ApprovalStatus.Draft.toString()"
              >Edit</el-button
            >
            <!-- <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改农田信息对话框 -->
  </div>
</template>

<script setup name="Farmland Approval" lang="ts">
import { addFarmland, autoCompleteFarmerId, autoCompleteFarmlandId, delFarmland, getFarmland, updateFarmland } from '@/api/demo/farmland';
import { FarmlandForm, FarmlandQuery, FarmlandVO } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { slope_class, land_use_type } = toRefs<any>(proxy?.useDict('slope_class', 'land_use_type'));
// 需求2.3：新增字典引用
const { land_ownership_type, slope_aspect, sampling_depth, land_use_record } = toRefs<any>(
  proxy?.useDict('land_ownership_type', 'slope_aspect', 'sampling_depth', 'land_use_record')
);

const farmlandList = ref<FarmlandVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const farmlandFormRef = ref<ElFormInstance>();

const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
async function getSoilTypes() {
  const res = await listSoilTypeMaster({ pageNum: 1, pageSize: 10 });
  soilTypeMasterList.value = res.rows;
}
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
async function getIrrigationTypes() {
  const res = await listIrrigationTypeMaster({ pageNum: 1, pageSize: 10 });
  irrigationTypeMasterList.value = res.rows;
}
const getSoilNameByCode = (code?: string) => {
  if (!code) return '';
  return soilTypeMasterList.value.find((item) => item.soilCode === code)?.soilName || code;
};
// 需求2.3：灌溉类型多选，逗号分隔显示名称
const getIrrigationNameByCode = (code?: string) => {
  if (!code) return '';
  return code.split(',').map(c => {
    return irrigationTypeMasterList.value.find((item) => item.irrigationCode === c.trim())?.irrigationName || c.trim();
  }).join(', ');
};
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FarmlandForm = {
  id: undefined,
  farmerId: undefined,
  kebeleId: undefined,
  gpsLat: undefined,
  gpsLong: undefined,
  gpsPolygon: undefined,
  areaTa: undefined,
  soilCode: undefined,
  irrigationCode: undefined,
  slopeClass: undefined,
  landUseType: undefined,
  elevationM: undefined,
  landOwnershipType: undefined,
  slopeAspect: undefined,
  samplingDepth: undefined,
  landUseRecord: undefined,
  infrastructureAccessibility: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedTime: undefined,
  rejectionReason: undefined,
  createdUserName: undefined,
  createTime: undefined,
  remark: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<FarmlandForm, FarmlandQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: undefined,
    farmerId: undefined,
    kebeleId: undefined,
    gpsLat: undefined,
    gpsLong: undefined,
    gpsPolygon: undefined,
    areaTa: undefined,
    soilCode: undefined,
    irrigationCode: undefined,
    slopeClass: undefined,
    landUseType: undefined,
    elevationM: undefined,
    landOwnershipType: undefined,
    slopeAspect: undefined,
    samplingDepth: undefined,
    landUseRecord: undefined,
    infrastructureAccessibility: undefined,
    status: undefined,
    approvedBy: undefined,
    approvedTime: undefined,
    rejectionReason: undefined,
    createdUserName: undefined,
    createTime: undefined,
    params: {
      // statusList: [ApprovalStatus.Draft.toString(), ApprovalStatus.Rejected.toString()]
    },
    orderByColumn: 'createTime',
    isAsc: 'desc'
    // orderByColumn: undefined,
    // isAsc: undefined
  },
  rules: {
    id: [{ required: true, message: 'Farm ID can not be null', trigger: 'blur' }],
    farmerId: [{ required: true, message: 'Farmer ID can not be null', trigger: 'blur' }],
    kebeleId: [{ required: true, message: 'Kebele ID can not be null', trigger: 'blur' }],
    areaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const toDialogGpsNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const dialogMapGpsLat = computed(() => toDialogGpsNumber(form.value.gpsLat));
const dialogMapGpsLong = computed(() => toDialogGpsNumber(form.value.gpsLong));

const farmLandIdOptions = ref([]);
const farmLandIdList = ref<any[]>([]);
const farmLandIdLoading = ref(false);
const farmLandIdRemoteMethod = async (query: string) => {
  if (query) {
    farmLandIdLoading.value = true;
    try {
      const res = await autoCompleteFarmlandId({
        id: query?.trim(),
        pageNum: null,
        pageSize: null
      });

      farmLandIdList.value = res.data;
      farmLandIdOptions.value = farmLandIdList.value.map((item) => ({
        value: item.id,
        label: item.id
      }));
    } catch (e) {
      console.error('autoCompleteFarmlandId failed:', e);
      farmLandIdList.value = [];
      farmLandIdOptions.value = [];
    } finally {
      farmLandIdLoading.value = false;
    }
  } else {
    farmLandIdOptions.value = [];
  }
};

const farmerIdOptions = ref([]);
const farmerIdList = ref<any[]>([]);
const farmerIdLoading = ref(false);
const farmerIdRemoteMethod = async (query: string) => {
  if (query) {
    farmerIdLoading.value = true;
    try {
      const res = await autoCompleteFarmerId({
        farmerId: query?.trim(),
        pageNum: null,
        pageSize: null
      });

      farmerIdList.value = res.data;
      farmerIdOptions.value = farmerIdList.value.map((item) => ({
        value: item.farmerId,
        label: item.farmerId
      }));
    } catch (e) {
      console.error('autoCompleteFarmerId failed:', e);
      farmerIdList.value = [];
      farmerIdOptions.value = [];
    } finally {
      farmerIdLoading.value = false;
    }
  } else {
    farmerIdOptions.value = [];
  }
};

/** 查询农田信息列表 */
const getList = async () => {
  loading.value = true;
  // const res = await listFarmland(queryParams.value);
  const res = await request({
    url: '/demo/farmland/list/approved',
    method: 'get',
    params: queryParams.value
  });
  farmlandList.value = res.rows;
  total.value = res.total;
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
  farmlandFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FarmlandVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add New FarmLand';
};

/** 修改按钮操作 */
const handleUpdate = (row?: FarmlandVO) => {
  const _id = row?.id || ids.value[0];
  if (row?.status != ApprovalStatus.Draft.toString()) {
    router.push({ name: 'FarmlandApprovalDetail', params: { id: _id } });
  } else {
    router.push({ name: 'FarmlandApprovalApprove', params: { id: _id } });
  }
};

/** 提交按钮 */
const submitForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      if (form.value.status == ApprovalStatus.Approved.toString()) {
        form.value.approvedTime = new Date().toLocaleString();
      }

      if (form.value.id) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FarmlandVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this FarmLand？').finally(() => (loading.value = false));
  await delFarmland(_ids);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/farmland/export',
    {
      ...queryParams.value
    },
    `farmland_${new Date().getTime()}.xlsx`
  );
};

const ApprovalForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Approved.toString();
      // form.value.approvedTime = new Date().toLocaleString();

      if (form.value.id) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};
const RejectForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.id) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  farmlandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.id) {
        await updateFarmland(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmland(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const isViewFlag = (data) => {
  return data.status != ApprovalStatus.Draft.toString();
};

onMounted(async () => {
  getSoilTypes();
  getIrrigationTypes();
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>
