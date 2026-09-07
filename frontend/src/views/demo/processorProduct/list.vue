<template>
  <el-table v-loading="loading" border :data="processorProductList" @selection-change="handleSelectionChange">
    <!-- <el-table-column type="selection" width="55" align="center" /> -->
    <el-table-column label="Product ID" align="center" prop="productId" v-if="true" :min-width="getColumnWidth('Product ID')" />
    <el-table-column label="Processor ID" align="center" prop="processorId" :min-width="getColumnWidth('Processor ID')" />
    <el-table-column label="Product Name" align="center" prop="productName" :min-width="getColumnWidth('Product Name')" />
    <el-table-column label="Product Category" align="center" prop="productCategory" :min-width="getColumnWidth('Product Category')">
      <template #default="scope">
        <dict-tag :options="t_agroprocessor_type" :value="scope.row.productCategory" />
      </template>
    </el-table-column>
    <el-table-column label="Standard Reference" align="center" prop="standardReference" :min-width="getColumnWidth('Standard Reference')" />
    <el-table-column label="Packaging Type" align="center" prop="packagingType" :min-width="getColumnWidth('Packaging Type')" />
    <el-table-column label="Export Eligible" align="center" prop="exportEligible" :min-width="getColumnWidth('Export Eligible')">
      <template #default="scope">
        <span>{{ scope.row.exportEligible === 1 ? 'Yes' : 'No' }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
      <template #default="scope">
        <el-tag>
          {{
            scope.row.status === String(ProcessorProductStatus.NeedRevision)
              ? scope.row.approvedComment
                ? props.ProcessorProductStatus[scope.row.status as ProcessorProductStatus]
                : 'NeedRevision'
              : props.ProcessorProductStatus[scope.row.status as ProcessorProductStatus]
          }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created  By')" />
    <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
      <template #default="scope">
        <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
    <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180" :min-width="getColumnWidth('Approved Date')">
      <template #default="scope">
        <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Approval Comment11" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
    <el-table-column
      label="Actions"
      align="center"
      fixed="right"
      class-name="action-column"
      :min-width="getColumnWidth('Actions')"
      :width="actionColumnWidth"
    >
      <template #default="scope">
        <el-button
          v-if="!canEdit(scope.row)"
          class="table-action-btn table-check-btn"
          icon="View"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['demo:processorProduct:edit']"
          >View</el-button
        >
        <template v-else>
          <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)" v-hasPermi="['demo:processorProduct:edit']"
            >Edit</el-button
          >
          <el-button
            v-if="canDelete(scope.row)"
            class="table-action-btn table-delete-btn"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['demo:processorProduct:remove']"
            >Delete</el-button
          >
        </template>
      </template>
    </el-table-column>
  </el-table>

  <pagination
    v-show="total > 0"
    :total="total"
    v-model:page="queryParams.pageNum"
    v-model:limit="queryParams.pageSize"
    @pagination="handlePagination"
  />
</template>

<script setup name="ProcessorProductList" lang="ts">
import { ProcessorProductVO, ProcessorProductQuery } from '@/api/demo/processorProduct/types';
import { ProcessorProductStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const props = withDefaults(
  defineProps<{
    loading: boolean;
    processorProductList: ProcessorProductVO[];
    t_agroprocessor_type: any[];
    ProcessorProductStatus: typeof ProcessorProductStatus;
    total: number;
    queryParams: ProcessorProductQuery;
    canEdit?: (row: ProcessorProductVO) => boolean;
    canDelete?: (row: ProcessorProductVO) => boolean;
  }>(),
  {
    canEdit: () => true,
    canDelete: () => true
  }
);

const emit = defineEmits<{
  selectionChange: [selection: ProcessorProductVO[]];
  update: [row: ProcessorProductVO];
  delete: [row: ProcessorProductVO];
  pagination: [];
}>();

const actionColumnWidth = computed(() => {
  const hasTwoButtons = props.processorProductList.some((row) => props.canEdit(row) && props.canDelete(row));
  return hasTwoButtons ? 210 : 110;
});

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProcessorProductVO[]) => {
  emit('selectionChange', selection);
};

/** 修改/查看按钮操作 */
const handleUpdate = (row: ProcessorProductVO) => {
  emit('update', row);
};

/** 删除按钮操作 */
const handleDelete = (row: ProcessorProductVO) => {
  emit('delete', row);
};

/** 分页事件 */
const handlePagination = () => {
  emit('pagination');
};
</script>
