<template>
  <div class="p-2">
    <AgroprocessorSearch
      :show-search="showSearch"
      :query-params="queryParams"
      :agroprocessor-all-list="agroprocessorAllList"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
        </el-row>
      </template>

      <AgroprocessorList
        :loading="loading"
        :agroprocessor-list="agroprocessorList"
        :t_agroprocessor_type="t_agroprocessor_type"
        :ownership_type="ownership_type"
        :technology_level="technology_level"
        :region_options="region"
        :AgroprocessorStatus="AgroprocessorStatus"
        :total="total"
        :query-params="queryParams"
        :can-edit="canEdit"
        :can-delete="canDelete"
        @selectionChange="handleSelectionChange"
        @update="handleUpdate"
        @delete="handleDelete"
        @pagination="getList"
      />
    </el-card>
    <!-- 添加或修改注册加工企业主对话框 -->
  </div>
</template>

<script setup name="Agroprocessor" lang="ts">
import { listAgroprocessor, getAgroprocessor, delAgroprocessor, addAgroprocessor, updateAgroprocessor } from '@/api/demo/agroprocessor';
import { AgroprocessorVO, AgroprocessorQuery, AgroprocessorForm } from '@/api/demo/agroprocessor/types';
import { AgroprocessorStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import AgroprocessorDialog from './dialog.vue';
import AgroprocessorSearch from './search.vue';
import AgroprocessorList from './list.vue';

/** 当前文件级别配置类，仅在本文件中使用 */
class AgroProcessorConfig {
  /** 页面标题名称 */
  public readonly title: string = 'Agro Processor';
}

/** 本文件唯一配置实例 */
const agroProcessorConfig = new AgroProcessorConfig();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { ownership_type, t_agroprocessor_type, technology_level,region } = toRefs<any>(proxy?.useDict('ownership_type', 't_agroprocessor_type', 'technology_level', 'region'));


const agroprocessorList = ref<AgroprocessorVO[]>([]);
const agroprocessorAllList = ref<AgroprocessorVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const agroprocessorFormRef = ref<InstanceType<typeof AgroprocessorDialog>>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: AgroprocessorForm = {
  processorId: undefined,
  processorName: undefined,
  processorType: undefined,
  registrationNumber: undefined,
  tinNumber: undefined,
  ownershipType: undefined,
  region: undefined,
  zone: undefined,
  woreda: undefined,
  gpsLat: undefined,
  gpsLong: undefined,
  processingCapacityPerDay: undefined,
  technologyLevel: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
}
const data = reactive<PageData<AgroprocessorForm, AgroprocessorQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    processorId: undefined,
    processorName: undefined,
    processorType: undefined,
    registrationNumber: undefined,
    tinNumber: undefined,
    ownershipType: undefined,
    region: undefined,
    zone: undefined,
    woreda: undefined,
    gpsLat: undefined,
    gpsLong: undefined,
    processingCapacityPerDay: undefined,
    technologyLevel: undefined,
    status: undefined,
    approvedBy: undefined,
    approvedComment: undefined,
    approvedAt: undefined,
    params: {
    }
  },
  rules: {
    processorId: [
      { required: true, message: "Processor ID is required", trigger: "blur" }
    ],
    processorName: [
      { required: true, message: "Processor Name is required", trigger: "blur" }
    ],
    processorType: [
      { required: true, message: "Processor Type is required", trigger: "change" }
    ],
    ownershipType: [
      { required: true, message: "Ownership Type is required", trigger: "change" }
    ],
    technologyLevel: [
      { required: true, message: "Technology Level is required", trigger: "change" }
    ],
    status: [
      { required: true, message: "status is required", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


/** 查询注册加工企业主列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAgroprocessor(queryParams.value);
  agroprocessorList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 查询全部注册加工企业主列表（用于搜索下拉） */
const getAllList = async () => {
  const res = await listAgroprocessor();
  agroprocessorAllList.value = res.rows;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  agroprocessorFormRef.value?.formRef?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  // console.log(queryParams.value);
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: AgroprocessorVO[]) => {
  ids.value = selection.map(item => item.processorId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Verify " + agroProcessorConfig.title;
}

/** 审批/查看按钮操作 */
const handleUpdate = (row?: AgroprocessorVO) => {
  const _processorId = row?.processorId || ids.value[0]
  // 根据状态跳转：Submitted 可审批显示 Verify，其他状态只读显示 View
  if (row && canEdit(row)) {
    router.push({ name: 'AgroprocessorApprove', params: { id: _processorId } });
  } else {
    router.push({ name: 'AgroprocessorDetail', params: { id: _processorId } });
  }
}

/** 提交按钮 */
const submitForm = () => {
  agroprocessorFormRef.value?.formRef?.validate(async (valid: boolean) => {
    console.log(valid);
    if (valid) {
      buttonLoading.value = true;
      if (form.value.processorId) {
        await updateAgroprocessor(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addAgroprocessor(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Success");
      dialog.visible = false;
      await getList();
      await getAllList();
    } else {
      proxy?.$modal.msgError("Please check the form");
    }
  });
}

/** 点击不同状态按钮时提交表单 */
const handleSubmitWithStatus = (status: AgroprocessorStatus) => {
  form.value.status = String(status);
  submitForm();
};

/** 底部各状态按钮对应的回调配置 */
const statusButtonHandlers: Partial<Record<AgroprocessorStatus, () => void>> = {
  // [AgroprocessorStatus.Draft]: () => handleSubmitWithStatus(AgroprocessorStatus.Draft),
  // [AgroprocessorStatus.Submitted]: () => handleSubmitWithStatus(AgroprocessorStatus.Submitted),
  [AgroprocessorStatus.Approved]: () => handleSubmitWithStatus(AgroprocessorStatus.Approved),
  [AgroprocessorStatus.Rejected]: () => handleSubmitWithStatus(AgroprocessorStatus.Rejected),
  [AgroprocessorStatus.NeedRevision]: () => handleSubmitWithStatus(AgroprocessorStatus.NeedRevision)
};

/** 删除按钮操作 */
const handleDelete = async (row?: AgroprocessorVO) => {
  const _processorIds = row?.processorId || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Agro Processor with ID "' + _processorIds + '" ?').finally(() => loading.value = false);
  await delAgroprocessor(_processorIds);
  proxy?.$modal.msgSuccess("Success");
  await getList();
  await getAllList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('demo/agroprocessor/export', {
    ...queryParams.value
  }, `agroprocessor_${new Date().getTime()}.xlsx`)
}

/** 判断是否可以编辑 */
const canEdit = (row: AgroprocessorVO): boolean => {
  // 可以根据 row 的数据来判断是否可以编辑
  // 例如：只有草稿状态可以编辑
  return row.status === String(AgroprocessorStatus.Submitted);
  // return true; // 默认返回 true，可以根据实际需求修改
}


/** 判断是否可以删除 */
const canDelete = (row: AgroprocessorVO): boolean => {
  // 可以根据 row 的数据来判断是否可以删除
  // 例如：只有草稿状态可以删除
  // return row.status === String(AgroprocessorStatus.Draft);
  return false;
  // return true; // 默认返回 true，可以根据实际需求修改
}

/** 判断是否展示审批意见 */
const showApprovedComment = (row: AgroprocessorForm): boolean => {
  // 可以根据 row 的数据来判断是否展示审批意见
  // 例如：只有已审批或已拒绝状态才展示
  return row.status === String(AgroprocessorStatus.Approved) || row.status === String(AgroprocessorStatus.Submitted);
  // return row.status != undefined && row.status != String(AgroprocessorStatus.Approved);
}

/** 判断是否显示审批意见输入框（不显示原有数据，让用户输入） */
const showApprovedCommentInput = (row: AgroprocessorForm): boolean => {
  // 只有 Draft 状态才需要编辑 ApprovedComment
  return row.status === String(AgroprocessorStatus.Submitted);
}

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
