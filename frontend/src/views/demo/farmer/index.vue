<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Farmer name" prop="name">
              <el-input prefix-icon="Search" v-model="queryParams.name" placeholder="请输入Farmer name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Phone number" prop="telephone">
              <el-input v-model="queryParams.telephone" placeholder="请输入Phone number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="ID card number" prop="idNo">
              <el-input v-model="queryParams.idNo" placeholder="请输入ID card number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="ID card type" prop="idType">
              <el-select v-model="queryParams.idType" placeholder="请选择ID card type" clearable>
                <el-option v-for="dict in ori_id_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Type" prop="tp">
              <el-input v-model="queryParams.tp" placeholder="请输入Type" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="ID validity period end date" prop="periodOfValidatyEndDt">
              <el-date-picker
                clearable
                v-model="queryParams.periodOfValidatyEndDt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择ID validity period end date"
              />
            </el-form-item>
            <el-form-item label="ID validity period start date" prop="periodOfValidatyStartDt">
              <el-date-picker
                clearable
                v-model="queryParams.periodOfValidatyStartDt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择ID validity period start date"
              />
            </el-form-item>
            <el-form-item label="Address" prop="address">
              <el-input v-model="queryParams.address" placeholder="请输入Address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Gender" prop="gender">
              <el-input v-model="queryParams.gender" placeholder="请输入Gender" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Photo URL" prop="photoUrl">
              <el-input v-model="queryParams.photoUrl" placeholder="请输入Photo URL" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Age" prop="age">
              <el-input v-model="queryParams.age" placeholder="请输入Age" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Review status" prop="reviewStatus">
              <el-select v-model="queryParams.reviewStatus" placeholder="请选择Review status (0: pending, 1: approved, 2: rejected)" clearable>
                <el-option v-for="dict in ori_review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="UserID" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="请输入UserID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:farmer:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:farmer:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:farmer:add']">新增</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="farmerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Primary key, auto-increment" align="center" prop="id" v-if="true" />
        <el-table-column label="Farmer name" align="center" prop="name" />
        <el-table-column label="Phone number" align="center" prop="telephone" />
        <el-table-column label="ID card number" align="center" prop="idNo" />
        <el-table-column label="ID card type" align="center" prop="idType">
          <template #default="scope">
            <dict-tag :options="ori_id_type" :value="scope.row.idType" />
          </template>
        </el-table-column>
        <el-table-column label="Type" align="center" prop="tp">
          <template #default="scope">
            <dict-tag :options="ori_farmer_type" :value="scope.row.tp" />
          </template>
        </el-table-column>
        <el-table-column label="ID validity period end date" align="center" prop="periodOfValidatyEndDt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.periodOfValidatyEndDt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="ID validity period start date" align="center" prop="periodOfValidatyStartDt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.periodOfValidatyStartDt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Address" align="center" prop="address" />
        <el-table-column label="Gender" align="center" prop="gender">
          <template #default="scope">
            <dict-tag :options="sys_user_sex" :value="scope.row.gender" />
          </template>
        </el-table-column>
        <el-table-column label="Photo URL" align="center" prop="photoUrl" />
        <el-table-column label="Age" align="center" prop="age" />
        <el-table-column label="Review status" align="center" prop="reviewStatus">
          <template #default="scope">
            <dict-tag :options="ori_review_status" :value="scope.row.reviewStatus" />
          </template>
        </el-table-column>
        <el-table-column label="UserID" align="center" prop="userId" />
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:farmer:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:farmer:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改Farmer basic information table对话框 -->
  </div>
</template>

<script setup name="Farmer" lang="ts">
import { listFarmer, getFarmer, delFarmer, addFarmer, updateFarmer } from '@/api/demo/farmer';
import { FarmerVO, FarmerQuery, FarmerForm } from '@/api/demo/farmer/types';
import { UserQuery, UserVO } from '@/api/system/user/types';
import { listUser } from '@/api/system/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { ori_id_type, ori_review_status, ori_farmer_type, sys_user_sex } = toRefs<any>(
  proxy?.useDict('ori_id_type', 'ori_review_status', 'ori_farmer_type', 'sys_user_sex')
);

const farmerList = ref<FarmerVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const farmerUserList = ref<UserVO[]>([]);

const queryFormRef = ref<ElFormInstance>();
const farmerFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FarmerForm = {
  id: undefined,
  name: undefined,
  telephone: undefined,
  idNo: undefined,
  idType: undefined,
  tp: undefined,
  periodOfValidatyEndDt: undefined,
  periodOfValidatyStartDt: undefined,
  address: undefined,
  gender: undefined,
  photoUrl: undefined,
  age: undefined,
  reviewStatus: undefined,
  userId: undefined
};
const data = reactive<PageData<FarmerForm, FarmerQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    telephone: undefined,
    idNo: undefined,
    idType: undefined,
    tp: undefined,
    periodOfValidatyEndDt: undefined,
    periodOfValidatyStartDt: undefined,
    address: undefined,
    gender: undefined,
    photoUrl: undefined,
    age: undefined,
    reviewStatus: undefined,
    userId: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: 'Primary key, auto-increment不能为空', trigger: 'blur' }],
    name: [{ required: true, message: 'Farmer name不能为空', trigger: 'blur' }],
    telephone: [{ required: true, message: 'Phone number不能为空', trigger: 'blur' }],
    idNo: [{ required: true, message: 'ID card number不能为空', trigger: 'blur' }],
    idType: [{ required: true, message: 'ID card type不能为空', trigger: 'change' }],
    tp: [{ required: true, message: 'Type不能为空', trigger: 'blur' }],
    periodOfValidatyEndDt: [{ required: true, message: 'ID validity period end date不能为空', trigger: 'blur' }],
    periodOfValidatyStartDt: [{ required: true, message: 'ID validity period start date不能为空', trigger: 'blur' }],
    address: [{ required: true, message: 'Address不能为空', trigger: 'blur' }],
    gender: [{ required: true, message: 'Gender不能为空', trigger: 'blur' }],
    age: [{ required: true, message: 'Age不能为空', trigger: 'blur' }],
    reviewStatus: [{ required: true, message: 'Review status (0: pending, 1: approved, 2: rejected)不能为空', trigger: 'change' }],
    userId: [{ required: true, message: 'UserID不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询Farmer basic information table列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFarmer(queryParams.value);
  farmerList.value = res.rows;
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
  farmerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FarmerVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'FarmerAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: FarmerVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'FarmerEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  farmerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateFarmer(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFarmer(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FarmerVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除Farmer basic information table编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delFarmer(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/farmer/export',
    {
      ...queryParams.value
    },
    `farmer_${new Date().getTime()}.xlsx`
  );
};

async function getAllFarmerUser() {
  const queryParams: UserQuery = {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    phonenumber: '',
    status: '',
    deptId: '',
    roleId: '',
    userIds: ''
  };
  const res = await listUser(queryParams);
  farmerUserList.value = res.rows;

  console.log('farmerUserList', res);
}

onMounted(() => {
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

