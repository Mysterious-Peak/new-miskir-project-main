<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="被审批实体的主键ID" prop="entityId">
              <el-input v-model="queryParams.entityId" placeholder="请输入被审批实体的主键ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="提交人用户ID" prop="submittedBy">
              <el-input v-model="queryParams.submittedBy" placeholder="请输入提交人用户ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审批人用户ID" prop="approvedBy">
              <el-input v-model="queryParams.approvedBy" placeholder="请输入审批人用户ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审批意见或备注" prop="comments">
              <el-input v-model="queryParams.comments" placeholder="请输入审批意见或备注" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审批完成时间" prop="approvalTime">
              <el-date-picker clearable
                v-model="queryParams.approvalTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择审批完成时间"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:approvalTask:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:approvalTask:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:approvalTask:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:approvalTask:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="approvalTaskList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="审批任务ID" align="center" prop="approvalTaskId" v-if="true" />
        <el-table-column label="AGROPROCESSOR、PROCESSING_LICENSE" align="center" prop="entityType" />
        <el-table-column label="被审批实体的主键ID" align="center" prop="entityId" />
        <el-table-column label="提交人用户ID" align="center" prop="submittedBy" />
        <el-table-column label="审批人用户ID" align="center" prop="approvedBy" />
        <el-table-column label="审批状态：0=Pending, 1=Approved, 2=Rejected" align="center" prop="approvalStatus" />
        <el-table-column label="审批意见或备注" align="center" prop="comments" />
        <el-table-column label="审批完成时间" align="center" prop="approvalTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvalTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:approvalTask:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:approvalTask:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改通用审批引擎核心，记录所有业务实体的审批任务对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="approvalTaskFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="被审批实体的主键ID" prop="entityId">
          <el-input v-model="form.entityId" placeholder="请输入被审批实体的主键ID" />
        </el-form-item>
        <el-form-item label="提交人用户ID" prop="submittedBy">
          <el-input v-model="form.submittedBy" placeholder="请输入提交人用户ID" />
        </el-form-item>
        <el-form-item label="审批人用户ID" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="请输入审批人用户ID" />
        </el-form-item>
        <el-form-item label="审批意见或备注" prop="comments">
            <el-input v-model="form.comments" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="审批完成时间" prop="approvalTime">
          <el-date-picker clearable
            v-model="form.approvalTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择审批完成时间">
          </el-date-picker>
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

<script setup name="ApprovalTask" lang="ts">
import { listApprovalTask, getApprovalTask, delApprovalTask, addApprovalTask, updateApprovalTask } from '@/api/demo/approvalTask';
import { ApprovalTaskVO, ApprovalTaskQuery, ApprovalTaskForm } from '@/api/demo/approvalTask/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const approvalTaskList = ref<ApprovalTaskVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const approvalTaskFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ApprovalTaskForm = {
  approvalTaskId: undefined,
  entityType: undefined,
  entityId: undefined,
  submittedBy: undefined,
  approvedBy: undefined,
  approvalStatus: undefined,
  comments: undefined,
  approvalTime: undefined,
}
const data = reactive<PageData<ApprovalTaskForm, ApprovalTaskQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    entityType: undefined,
    entityId: undefined,
    submittedBy: undefined,
    approvedBy: undefined,
    approvalStatus: undefined,
    comments: undefined,
    approvalTime: undefined,
    params: {
    }
  },
  rules: {
    approvalTaskId: [
      { required: true, message: "审批任务ID不能为空", trigger: "blur" }
    ],
    entityType: [
      { required: true, message: "AGROPROCESSOR、PROCESSING_LICENSE不能为空", trigger: "change" }
    ],
    entityId: [
      { required: true, message: "被审批实体的主键ID不能为空", trigger: "blur" }
    ],
    approvalStatus: [
      { required: true, message: "审批状态：0=Pending, 1=Approved, 2=Rejected不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询通用审批引擎核心，记录所有业务实体的审批任务列表 */
const getList = async () => {
  loading.value = true;
  const res = await listApprovalTask(queryParams.value);
  approvalTaskList.value = res.rows;
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
  approvalTaskFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ApprovalTaskVO[]) => {
  ids.value = selection.map(item => item.approvalTaskId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加通用审批引擎核心，记录所有业务实体的审批任务";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ApprovalTaskVO) => {
  reset();
  const _approvalTaskId = row?.approvalTaskId || ids.value[0]
  const res = await getApprovalTask(_approvalTaskId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改通用审批引擎核心，记录所有业务实体的审批任务";
}

/** 提交按钮 */
const submitForm = () => {
  approvalTaskFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.approvalTaskId) {
        await updateApprovalTask(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addApprovalTask(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ApprovalTaskVO) => {
  const _approvalTaskIds = row?.approvalTaskId || ids.value;
  await proxy?.$modal.confirm('是否确认删除通用审批引擎核心，记录所有业务实体的审批任务编号为"' + _approvalTaskIds + '"的数据项？').finally(() => loading.value = false);
  await delApprovalTask(_approvalTaskIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('demo/approvalTask/export', {
    ...queryParams.value
  }, `approvalTask_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
