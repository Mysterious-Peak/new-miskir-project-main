<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改仓库主数据对话框 -->
      <el-form ref="warehouseMasterFormRef" :model="form" :rules="rules" label-width="auto">
        <!-- <el-form-item label="主键ID" prop="id">
          <el-input v-model="form.id" placeholder="Please input " />
        </el-form-item> -->
        <el-form-item label="Warehouse ID" prop="warehouseId">
          <el-input v-model="form.warehouseId" placeholder="Please input Warehouse ID" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Warehouse Name" prop="warehouseName">
          <el-input v-model="form.warehouseName" placeholder="Please input Warehouse Name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="Warehouse Type" prop="warehouseType">
          <el-select v-model="form.warehouseType" placeholder="Please select Use Type" style="width: 100%">
            <el-option v-for="item in warehouse_type" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Location" prop="location">
          <el-input v-model="form.location" type="textarea" placeholder="Please input " maxlength="150" show-word-limit />
        </el-form-item>
        <el-form-item label="Capacity (Mt)" prop="capacityMt">
          <el-input-number v-model="form.capacityMt" placeholder="Please input " :min="0" :max="99999999.99" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Area (m²)" prop="areaSqM">
          <el-input-number v-model="form.areaSqM" placeholder="Please input " :min="0" :max="99999999.99" style="width: 100%" />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="WarehouseMasterForm" lang="ts">
import { addWarehouseMaster, getWarehouseMaster, updateWarehouseMaster } from '@/api/demo/warehouseMaster';
import { WarehouseMasterForm } from '@/api/demo/warehouseMaster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { warehouse_type } = toRefs<any>(proxy?.useDict('warehouse_type'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const warehouseMasterFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: WarehouseMasterForm = {
  id: undefined,
  warehouseId: undefined,
  warehouseName: undefined,
  warehouseType: undefined,
  location: undefined,
  capacityMt: undefined,
  areaSqM: undefined
};

const form = ref<WarehouseMasterForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse ID cannot be empty', trigger: 'blur' }],
  warehouseName: [{ required: true, message: 'Warehouse Name cannot be empty', trigger: 'blur' }],
  warehouseType: [{ required: true, message: 'Warehouse Type cannot be empty', trigger: 'change' }],
  location: [{ required: true, message: 'Location cannot be empty', trigger: 'blur' }],
  capacityMt: [{ required: true, message: 'Capacity cannot be empty', trigger: 'blur' }],
  areaSqM: [{ required: true, message: 'Area cannot be empty', trigger: 'blur' }]
};

/** Load record for edit mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getWarehouseMaster(id.value);
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
  warehouseMasterFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateWarehouseMaster(form.value);
      } else {
        await addWarehouseMaster(form.value);
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
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
