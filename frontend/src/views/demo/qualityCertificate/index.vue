<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="production_batch_id" prop="productionBatchId">
              <el-input prefix-icon="Search" v-model="queryParams.productionBatchId" placeholder="请输入production_batch_id" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="issuing_body" prop="issuingBody">
              <el-input v-model="queryParams.issuingBody" placeholder="请输入issuing_body" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="valid_until" prop="validUntil">
              <el-date-picker clearable
                v-model="queryParams.validUntil"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择valid_until"
              />
            </el-form-item>
            <el-form-item label="document_url" prop="documentUrl">
              <el-input v-model="queryParams.documentUrl" placeholder="请输入document_url" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="approved_by" prop="approvedBy">
              <el-input v-model="queryParams.approvedBy" placeholder="请输入approved_by" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="approved_by" prop="approvedComment">
              <el-input v-model="queryParams.approvedComment" placeholder="请输入approved_by" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approval Time" prop="approvedAt">
              <el-date-picker clearable
                v-model="queryParams.approvedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择Approval Time"
              />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:qualityCertificate:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:qualityCertificate:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="router.push({ name: 'QualityCertificateAdd' })" v-hasPermi="['demo:qualityCertificate:add']">新增</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="qualityCertificateList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="certificate_id" align="center" prop="certificateId" v-if="true" />
        <el-table-column label="production_batch_id" align="center" prop="productionBatchId" />
        <el-table-column label="ISO / Organic / Export" align="center" prop="certificateType" />
        <el-table-column label="issuing_body" align="center" prop="issuingBody" />
        <el-table-column label="valid_until" align="center" prop="validUntil" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.validUntil, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="document_url" align="center" prop="documentUrl" />
        <el-table-column label="approved_by" align="center" prop="approvedBy" />
        <el-table-column label="approved_by" align="center" prop="approvedComment" />
        <el-table-column label="Approval Time" align="center" prop="approvedAt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="router.push({ name: 'QualityCertificateEdit', params: { id: scope.row.certificateId } })" v-hasPermi="['demo:qualityCertificate:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:qualityCertificate:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改质量认证证书对话框 -->
  </div>
</template>

<script setup name="QualityCertificate" lang="ts">
import { listQualityCertificate, getQualityCertificate, delQualityCertificate, addQualityCertificate, updateQualityCertificate } from '@/api/demo/qualityCertificate';
import { QualityCertificateVO, QualityCertificateQuery, QualityCertificateForm } from '@/api/demo/qualityCertificate/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const qualityCertificateList = ref<QualityCertificateVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const qualityCertificateFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: QualityCertificateForm = {
  certificateId: undefined,
  productionBatchId: undefined,
  certificateType: undefined,
  issuingBody: undefined,
  validUntil: undefined,
  documentUrl: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
}
const data = reactive<PageData<QualityCertificateForm, QualityCertificateQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productionBatchId: undefined,
    certificateType: undefined,
    issuingBody: undefined,
    validUntil: undefined,
    documentUrl: undefined,
    approvedBy: undefined,
    approvedComment: undefined,
    approvedAt: undefined,
    params: {
    }
  },
  rules: {
    certificateId: [
      { required: true, message: "certificate_id不能为空", trigger: "blur" }
    ],
    productionBatchId: [
      { required: true, message: "production_batch_id不能为空", trigger: "blur" }
    ],
    certificateType: [
      { required: true, message: "ISO / Organic / Export不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询质量认证证书列表 */
const getList = async () => {
  loading.value = true;
  const res = await listQualityCertificate(queryParams.value);
  qualityCertificateList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  qualityCertificateFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: QualityCertificateVO[]) => {
  ids.value = selection.map(item => item.certificateId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加质量认证证书";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: QualityCertificateVO) => {
  reset();
  const _certificateId = row?.certificateId || ids.value[0]
  const res = await getQualityCertificate(_certificateId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改质量认证证书";
}

/** 提交按钮 */
const submitForm = () => {
  qualityCertificateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.certificateId) {
        await updateQualityCertificate(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addQualityCertificate(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: QualityCertificateVO) => {
  const _certificateIds = row?.certificateId || ids.value;
  await proxy?.$modal.confirm('是否确认删除质量认证证书编号为"' + _certificateIds + '"的数据项？').finally(() => loading.value = false);
  await delQualityCertificate(_certificateIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('demo/qualityCertificate/export', {
    ...queryParams.value
  }, `qualityCertificate_${new Date().getTime()}.xlsx`)
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

