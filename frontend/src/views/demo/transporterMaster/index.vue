<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
            <el-form-item label="Transporter Code" prop="transporterId">
              <el-input prefix-icon="Search" v-model="queryParams.transporterId" placeholder="Please enter Transporter Code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Name" prop="name">
              <el-input v-model="queryParams.name" placeholder="Please enter Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Vehicle Plate" prop="vehiclePlate">
              <el-input v-model="queryParams.vehiclePlate" placeholder="Please enter Vehicle Plate" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Vehicle Capacity (MT)" prop="capacityMt">
              <el-input v-model="queryParams.capacityMt" placeholder="Please enter Vehicle Capacity (MT)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="GPS Tracking Enabled (0=No, 1=Yes)" prop="gpsEnabled">
              <el-input
                v-model="queryParams.gpsEnabled"
                placeholder="Please enter GPS Tracking Enabled (0=No, 1=Yes)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Contact Phone" prop="phone">
              <el-input v-model="queryParams.phone" placeholder="Please enter Contact Phone" clearable @keyup.enter="handleQuery" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:transporterMaster:export']">Export</el-button>
          </el-col> --> 
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:transporterMaster:remove']">
              Delete
            </el-button>
          </el-col> -->
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:transporterMaster:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="transporterMasterList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('Primary Key ID')" />
        <el-table-column label="Transporter Code" align="center" prop="transporterId" :min-width="getColumnWidth('Transporter Code')" />
        <el-table-column label="Name" align="center" prop="name" :min-width="getColumnWidth('Name')" />
        <el-table-column label="Vehicle Plate" align="center" prop="vehiclePlate" :min-width="getColumnWidth('Vehicle Plate')" />
        <el-table-column label="Vehicle Capacity (MT)" align="center" prop="capacityMt" :min-width="getColumnWidth('Vehicle Capacity (MT)')" />
        <el-table-column
          label="GPS Tracking Enabled (0=No, 1=Yes)"
          align="center"
          prop="gpsEnabled"
          :min-width="getColumnWidth('GPS Tracking Enabled (0=No, 1=Yes)')"
        />
        <el-table-column label="Phone" align="center" prop="phone" :min-width="getColumnWidth('Phone')" />
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['demo:transporterMaster:edit']"
              >Edit</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:transporterMaster:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="TransporterMaster" lang="ts">
import {
  listTransporterMaster,
  getTransporterMaster,
  delTransporterMaster,
  addTransporterMaster,
  updateTransporterMaster
} from '@/api/demo/transporterMaster';
import { TransporterMasterVO, TransporterMasterQuery, TransporterMasterForm } from '@/api/demo/transporterMaster/types';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const transporterMasterList = ref<TransporterMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const transporterMasterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TransporterMasterForm = {
  id: undefined,
  transporterId: undefined,
  name: undefined,
  vehiclePlate: undefined,
  capacityMt: undefined,
  gpsEnabled: 0,
  phone: undefined
};
const data = reactive<PageData<TransporterMasterForm, TransporterMasterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    transporterId: undefined,
    name: undefined,
    vehiclePlate: undefined,
    capacityMt: undefined,
    gpsEnabled: undefined,
    phone: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: 'Primary Key ID cannot be empty', trigger: 'blur' }],
    transporterId: [{ required: true, message: 'Transporter Code cannot be empty', trigger: 'blur' }],
    name: [{ required: true, message: 'Transporter/Owner Name cannot be empty', trigger: 'blur' }],
    vehiclePlate: [{ required: true, message: 'Vehicle Plate Number cannot be empty', trigger: 'blur' }],
    capacityMt: [{ required: true, message: 'Vehicle Capacity (MT) cannot be empty', trigger: 'blur' }],
    gpsEnabled: [{ required: true, message: 'GPS Tracking Enabled (0=No, 1=Yes) cannot be empty', trigger: 'blur' }],
    phone: [{ required: true, message: 'Contact Phone cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Transporter Master List */
const getList = async () => {
  loading.value = true;
  const res = await listTransporterMaster(queryParams.value);
  transporterMasterList.value = res.rows;
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
  transporterMasterFormRef.value?.resetFields();
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

/** Multi-select Change */
const handleSelectionChange = (selection: TransporterMasterVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'TransporterMasterAdd' });
};

/** Edit Button Action */
const handleUpdate = (row?: TransporterMasterVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'TransporterMasterEdit', params: { id: _id } });
};

/** Submit Button */
const submitForm = () => {
  transporterMasterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTransporterMaster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTransporterMaster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: TransporterMasterVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Transporter Master with ID "' + _ids + '"?').finally(() => {
    loading.value = false;
  });
  await delTransporterMaster(_ids);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/transporterMaster/export',
    {
      ...queryParams.value
    },
    `transporterMaster_${new Date().getTime()}.xlsx`
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
</script>

