<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Cold Chain Reading Id" prop="sensorId">
              <el-select
                v-model="queryParams.sensorId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="sensorIdRemoteMethod"
                :loading="sensorIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in sensorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Trip Id" prop="tripId">
              <el-select
                v-model="queryParams.tripId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="tripIdRemoteMethod"
                :loading="tripIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in tripIdOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe fit :data="coldChainReadingList" @selection-change="handleSelectionChange">
        <el-table-column
          label="Cold Chain Reading Id"
          align="center"
          prop="sensorId"
          v-if="true"
          :min-width="getColumnWidth('Cold Chain Reading Id')"
        />
        <el-table-column label="Trip Id" align="center" prop="tripId" :min-width="getColumnWidth('Trip Id')" />
        <el-table-column label="Temperature" align="center" prop="temperature" :min-width="getColumnWidth('Temperature')" />

        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)">Edit</el-button>
            <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改冷链温度读数对话框 -->
  </div>
</template>

<script setup name="ColdChainReading" lang="ts">
import {
  addColdChainReading,
  delColdChainReading,
  getColdChainReading,
  listColdChainReading,
  updateColdChainReading
} from '@/api/demo/coldChainReading';
import { ColdChainReadingForm, ColdChainReadingQuery, ColdChainReadingVO } from '@/api/demo/coldChainReading/types';
import { listTrip } from '@/api/demo/trip';
import { TripVO } from '@/api/demo/trip/types';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const coldChainReadingList = ref<ColdChainReadingVO[]>([]);
const coldChainReadingAllList = ref<ColdChainReadingVO[]>([]);
const tripList = ref<TripVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const coldChainReadingFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ColdChainReadingForm = {
  sensorId: undefined,
  tripId: undefined,
  temperature: undefined
};
const data = reactive<PageData<ColdChainReadingForm, ColdChainReadingQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sensorId: undefined,
    tripId: undefined,
    temperature: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    tripId: [{ required: true, message: 'Trip Id cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const sensorIdOptions = ref([]);
const sensorIdList = ref([]);
const sensorIdLoading = ref(false);
const sensorIdRemoteMethod = async (query: string) => {
  if (query) {
    sensorIdLoading.value = true;
    sensorIdList.value = coldChainReadingList.value
      .filter((f) => f.sensorId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.sensorId);
    sensorIdOptions.value = sensorIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    sensorIdLoading.value = false;
  } else {
    sensorIdOptions.value = [];
  }
};

const tripIdOptions = ref([]);
const tripIdList = ref([]);
const tripIdLoading = ref(false);
const tripIdRemoteMethod = async (query: string) => {
  if (query) {
    tripIdLoading.value = true;
    tripIdList.value = [
      ...new Set(coldChainReadingList.value.filter((f) => f.tripId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.tripId))
    ];
    tripIdOptions.value = tripIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    tripIdLoading.value = false;
  } else {
    tripIdOptions.value = [];
  }
};

const tripIdPopOptions = ref([]);
const tripIdPopLoading = ref(false);
const tripIdPopRemoteMethod = async (query: string) => {
  if (query) {
    tripIdPopLoading.value = true;
    const list = tripList.value.filter((f) => f.tripId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.tripId);
    tripIdPopOptions.value = list.map((item) => ({
      value: item,
      label: item
    }));
    tripIdPopLoading.value = false;
  } else {
    tripIdPopOptions.value = [];
  }
};

/** 查询冷链温度读数列表 */
const getList = async () => {
  loading.value = true;
  const res = await listColdChainReading(queryParams.value);
  coldChainReadingList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查询GPS轨迹列表 */
const getAllList = async () => {
  const res = await listColdChainReading();
  coldChainReadingAllList.value = res.rows;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  coldChainReadingFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ColdChainReadingVO[]) => {
  ids.value = selection.map((item) => item.sensorId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const dialogAction = ref('');

const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'ColdChainReadingAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: ColdChainReadingVO) => {
  const _sensorId = row?.sensorId || ids.value[0];
  router.push({ name: 'ColdChainReadingEdit', params: { id: _sensorId } });
};

/** 提交按钮 */
const submitForm = () => {
  coldChainReadingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.sensorId) {
        await updateColdChainReading(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addColdChainReading(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ColdChainReadingVO) => {
  const _sensorIds = row?.sensorId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delColdChainReading(_sensorIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
  await getAllList();
};

onMounted(() => {
  getList();
  getAllList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>
