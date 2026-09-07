<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改Farmer basic information table对话框 -->
      <el-form ref="farmerFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Farmer name" prop="name">
          <el-input v-model="form.name" placeholder="请输入Farmer name" />
        </el-form-item>
        <el-form-item label="Phone number" prop="telephone">
          <el-input v-model="form.telephone" placeholder="请输入Phone number" />
        </el-form-item>
        <el-form-item label="ID card number" prop="idNo">
          <el-input v-model="form.idNo" placeholder="请输入ID card number" />
        </el-form-item>
        <el-form-item label="ID card type" prop="idType">
          <el-select v-model="form.idType" placeholder="请选择ID card type">
            <el-option v-for="dict in ori_id_type" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Type" prop="tp">
          <el-input v-model="form.tp" placeholder="请输入Type" />
        </el-form-item>
        <el-form-item label="ID validity period end date" prop="periodOfValidatyEndDt">
          <el-date-picker
            clearable
            v-model="form.periodOfValidatyEndDt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择ID validity period end date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="ID validity period start date" prop="periodOfValidatyStartDt">
          <el-date-picker
            clearable
            v-model="form.periodOfValidatyStartDt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择ID validity period start date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Address" prop="address">
          <el-input v-model="form.address" placeholder="请输入Address" />
        </el-form-item>
        <el-form-item label="Gender" prop="gender">
          <el-input v-model="form.gender" placeholder="请输入Gender" />
        </el-form-item>
        <el-form-item label="Photo URL" prop="photoUrl">
          <el-input v-model="form.photoUrl" placeholder="请输入Photo URL" />
        </el-form-item>
        <el-form-item label="Age" prop="age">
          <el-input v-model="form.age" placeholder="请输入Age" />
        </el-form-item>
        <el-form-item label="Review status" prop="reviewStatus">
          <el-radio-group v-model="form.reviewStatus">
            <el-radio v-for="dict in ori_review_status" :key="dict.value" :value="parseInt(dict.value)">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="UserID" prop="userId">
          <el-select v-model="form.userId" placeholder="请输入User">
            <el-option v-for="item in farmerUserList" :key="item.userId" :label="item.nickName" :value="item.userId" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="FarmerForm" lang="ts">
import { getFarmer, addFarmer, updateFarmer } from '@/api/demo/farmer';
import { FarmerForm } from '@/api/demo/farmer/types';
import { UserQuery, UserVO } from '@/api/system/user/types';
import { listUser } from '@/api/system/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { ori_id_type, ori_review_status, ori_farmer_type, sys_user_sex } = toRefs<any>(
  proxy?.useDict('ori_id_type', 'ori_review_status', 'ori_farmer_type', 'sys_user_sex')
);
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const farmerFormRef = ref<ElFormInstance>();
const farmerUserList = ref<UserVO[]>([]);

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<FarmerForm>({ ...initFormData });

const rules = {
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
};

/** Load Farmer User List */
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

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getFarmer(id.value);
    Object.assign(form.value, res.data);
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
  farmerFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateFarmer(form.value);
      } else {
        await addFarmer(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(() => {
  loadRecord();
  getAllFarmerUser();
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
