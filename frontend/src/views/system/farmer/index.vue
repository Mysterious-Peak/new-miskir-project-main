<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="Farmer Name" prop="nickName">
              <el-input v-model="queryParams.nickName" placeholder="请输入Farmer Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Contact Telephone" prop="phonenumber">
              <el-input v-model="queryParams.phonenumber" placeholder="请输入Contact Telephone" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="ID Card Number" prop="idNo">
              <el-input v-model="queryParams.idNo" placeholder="请输入ID Card Number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="ID Card Type" prop="idType">
              <el-select v-model="queryParams.idType" placeholder="请选择ID Card Type" clearable>
                <el-option v-for="dict in ori_id_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Farmer Type" prop="tp">
              <el-select v-model="queryParams.tp" placeholder="请选择Farmer Type" clearable>
                <el-option v-for="dict in ori_farmer_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="ID Validity Period End Date" prop="periodOfValidatyEndDt">
              <el-date-picker
                clearable
                v-model="queryParams.periodOfValidatyEndDt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择ID Validity Period End Date"
              />
            </el-form-item>
            <el-form-item label="ID Validity Period Start Date" prop="periodOfValidatyStartDt">
              <el-date-picker
                clearable
                v-model="queryParams.periodOfValidatyStartDt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择ID Validity Period Start Date"
              />
            </el-form-item>
            <el-form-item label="Address" prop="address">
              <el-input v-model="queryParams.address" placeholder="请输入Address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Gender" prop="sex">
              <el-select v-model="queryParams.sex" placeholder="请选择Gender" clearable>
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Age" prop="age">
              <el-input v-model="queryParams.age" placeholder="请输入Age" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
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
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:farmer:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:farmer:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:farmer:remove']"
              >删除</el-button
            >
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:farmer:export']">导出</el-button>
          </el-col> -->
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="farmerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="User ID" align="center" prop="userId" v-if="true" />
        <el-table-column label="User Name" align="center" prop="userName" />
        <el-table-column label="Farmer Name" align="center" prop="nickName" />
        <el-table-column label="Contact Telephone" align="center" prop="phonenumber" />
        <el-table-column label="E-mail" align="center" prop="email" />
        <el-table-column label="ID Card Number" align="center" prop="idNo" />
        <el-table-column label="ID Card Type" align="center" prop="idType">
          <template #default="scope">
            <dict-tag :options="ori_id_type" :value="scope.row.idType" />
          </template>
        </el-table-column>
        <el-table-column label="Farmer Type" align="center" prop="tp">
          <template #default="scope">
            <dict-tag :options="ori_farmer_type" :value="scope.row.tp" />
          </template>
        </el-table-column>
        <el-table-column label="ID Validity Period End Date" align="center" prop="periodOfValidatyEndDt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.periodOfValidatyEndDt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="ID Validity Period Start Date" align="center" prop="periodOfValidatyStartDt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.periodOfValidatyStartDt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Address" align="center" prop="address" />
        <el-table-column label="Gender" align="center" prop="sex">
          <template #default="scope">
            <dict-tag :options="sys_user_sex" :value="scope.row.gender" />
          </template>
        </el-table-column>
        <el-table-column label="Photo URL" align="center" prop="photoUrlUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.photoUrlUrl" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="Age" align="center" prop="age" />
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:farmer:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:farmer:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改Farmer Management对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="farmerFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="User Name" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入User Name" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" placeholder="请输入Password" />
        </el-form-item>
        <el-form-item label="Repeat Password" prop="repeatPassword">
          <el-input v-model="form.repeatPassword" placeholder="请再次输入User Name" />
        </el-form-item>
        <el-form-item label="Farmer Name" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入Farmer Name" />
        </el-form-item>
        <el-form-item label="Contact Telephone" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入Contact Telephone" />
        </el-form-item>
        <el-form-item label="ID Card Number" prop="idNo">
          <el-input v-model="form.idNo" placeholder="请输入ID Card Number" />
        </el-form-item>
        <el-form-item label="ID Card Type" prop="idType">
          <el-select v-model="form.idType" placeholder="请选择ID Card Type">
            <el-option v-for="dict in ori_id_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Farmer Type" prop="tp">
          <el-select v-model="form.tp" placeholder="请选择Farmer Type">
            <el-option v-for="dict in ori_farmer_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="ID Validity Period End Date" prop="periodOfValidatyEndDt">
          <el-date-picker
            clearable
            v-model="form.periodOfValidatyEndDt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择ID Validity Period End Date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="ID Validity Period Start Date" prop="periodOfValidatyStartDt">
          <el-date-picker
            clearable
            v-model="form.periodOfValidatyStartDt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择ID Validity Period Start Date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Address" prop="address">
          <el-input v-model="form.address" placeholder="请输入Address" />
        </el-form-item>
        <el-form-item label="Gender" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择Gender">
            <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Photo URL" prop="photoUrl">
          <image-upload v-model="form.photoUrl" />
        </el-form-item>
        <el-form-item label="Age" prop="age">
          <el-input v-model="form.age" placeholder="请输入Age" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Farmer" lang="ts">
import { listFarmer, getFarmer, delFarmer, addFarmer, updateFarmer } from '@/api/system/farmer';
import { FarmerVO, FarmerQuery, FarmerForm } from '@/api/system/farmer/types';
import user from '@/api/system/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { ori_id_type, ori_farmer_type, sys_user_sex } = toRefs<any>(proxy?.useDict('ori_id_type', 'ori_farmer_type', 'sys_user_sex'));

const farmerList = ref<FarmerVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const farmerFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FarmerForm = {
  userId: undefined,
  userName: undefined,
  password: undefined,
  repeatPassword: undefined,
  nickName: undefined,
  phonenumber: undefined,
  idNo: undefined,
  idType: undefined,
  tp: undefined,
  periodOfValidatyEndDt: undefined,
  periodOfValidatyStartDt: undefined,
  address: undefined,
  sex: undefined,
  photoUrl: undefined,
  age: undefined
};
const data = reactive<PageData<FarmerForm, FarmerQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    nickName: undefined,
    phonenumber: undefined,
    idNo: undefined,
    idType: undefined,
    tp: undefined,
    periodOfValidatyEndDt: undefined,
    periodOfValidatyStartDt: undefined,
    address: undefined,
    sex: undefined,
    photoUrl: undefined,
    age: undefined,
    params: {}
  },
  rules: {
    userId: [{ required: true, message: 'Primary Key ID不能为空', trigger: 'blur' }],
    nickName: [{ required: true, message: 'Farmer Name不能为空', trigger: 'blur' }],
    userName: [{ required: true, message: 'User Name不能为空', trigger: 'blur' }],
    password: [{ required: true, message: 'Password不能为空', trigger: 'blur' }],
    repeatPassword: [{ required: true, message: 'Repeat Password不能为空', trigger: 'blur' }],
    phonenumber: [{ required: true, message: 'Contact Telephone不能为空', trigger: 'blur' }],
    idNo: [{ required: true, message: 'ID Card Number不能为空', trigger: 'blur' }],
    idType: [{ required: true, message: 'ID Card Type不能为空', trigger: 'change' }],
    tp: [{ required: true, message: 'Farmer Type不能为空', trigger: 'change' }],
    periodOfValidatyEndDt: [{ required: true, message: 'ID Validity Period End Date不能为空', trigger: 'blur' }],
    periodOfValidatyStartDt: [{ required: true, message: 'ID Validity Period Start Date不能为空', trigger: 'blur' }],
    address: [{ required: true, message: 'Address不能为空', trigger: 'blur' }],
    sex: [{ required: true, message: 'Gender不能为空', trigger: 'change' }],
    age: [{ required: true, message: 'Age不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询Farmer Management列表 */
const getList = async () => {
  loading.value = true;
  const res = await listFarmer(queryParams.value);
  farmerList.value = res.rows;
  total.value = res.total;
  loading.value = false;

  console.log(farmerList.value);
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
  ids.value = selection.map((item) => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加Farmer Management';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: FarmerVO) => {
  reset();
  const _id = row?.userId || ids.value[0];
  const res = await getFarmer(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改Farmer Management';
};

/** 提交按钮 */
const submitForm = () => {
  farmerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.userId) {
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
  const _ids = row?.userId || ids.value;
  await proxy?.$modal.confirm('是否确认删除Farmer Management编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delFarmer(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/farmer/export',
    {
      ...queryParams.value
    },
    `farmer_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
