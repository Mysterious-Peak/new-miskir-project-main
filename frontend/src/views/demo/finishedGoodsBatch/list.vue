<template>
  <el-table v-loading="loading" border :data="finishedGoodsBatchList" @selection-change="handleSelectionChange">
    <el-table-column label="Finished Batch ID" align="center" prop="finishedBatchId" v-if="true" :min-width="getColumnWidth('Finished Batch ID')" />
    <el-table-column label="Production Batch ID" align="center" prop="productionBatchId" :min-width="getColumnWidth('Production Batch ID')" />
    <el-table-column label="Warehouse Code" align="center" prop="warehouseCode" :min-width="getColumnWidth('Warehouse Code')"> </el-table-column>
    <el-table-column label="QR Code" align="center" prop="qrCodeUrl" :min-width="getColumnWidth('QR Code')">
      <template #default="scope">
        <image-preview :src="scope.row.qrCodeUrl" :width="50" :height="50" />
      </template>
    </el-table-column>
    <el-table-column
      label="Stock Keeping Unit Code"
      align="center"
      prop="stockKeepingUnitCode"
      :min-width="getColumnWidth('Stock Keeping Unit Code')"
    />
    <el-table-column label="Quantity" align="center" prop="quantity" :min-width="getColumnWidth('Quantity')" />
    <el-table-column label="Packaging Type" align="center" prop="packagingType" :min-width="getColumnWidth('Packaging Type')">
      <template #default="scope">
        <dict-tag :options="packaging_type" :value="scope.row.packagingType" />
      </template>
    </el-table-column>
    <el-table-column label="Expiry Date" align="center" prop="expiryDate" :min-width="getColumnWidth('Expiry Date')">
      <template #default="scope">
        <span>{{ parseTime(scope.row.expiryDate, '{y}-{m}-{d}') }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
      <template #default="scope">
        <el-tag>
          {{
            scope.row.status === String(FinishedGoodsBatchStatus.NeedRevision)
              ? scope.row.approvedComment
                ? FinishedGoodsBatchStatus[Number(scope.row.status)]
                : 'NeedRevision'
              : FinishedGoodsBatchStatus[Number(scope.row.status)]
          }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
    <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
      <template #default="scope">
        <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
    <el-table-column label="Approved Date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approved Date')">
      <template #default="scope">
        <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
    <el-table-column label="Actions" align="center" fixed="right" :width="actionColumnWidth" class-name="action-column">
      <template #default="scope">
        <el-button
          v-if="!canEdit(scope.row)"
          class="table-action-btn table-check-btn"
          icon="View"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['demo:finishedGoodsBatch:edit']"
          >View</el-button
        >
        <template v-else>
          <el-button
            class="table-action-btn table-edit-btn"
            icon="EditPen"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['demo:finishedGoodsBatch:edit']"
            >Edit</el-button
          >
          <el-button
            v-if="canDelete(scope.row)"
            class="table-action-btn table-delete-btn"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['demo:finishedGoodsBatch:remove']"
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

<script setup name="FinishedGoodsBatchList" lang="ts">
import { FinishedGoodsBatchVO, FinishedGoodsBatchQuery } from '@/api/demo/finishedGoodsBatch/types';
import { FinishedGoodsBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
import { parseTime } from '@/utils/ruoyi';

const props = withDefaults(
  defineProps<{
    loading: boolean;
    finishedGoodsBatchList: FinishedGoodsBatchVO[];
    packaging_type: any[];
    FinishedGoodsBatchStatus: typeof FinishedGoodsBatchStatus;
    total: number;
    queryParams: FinishedGoodsBatchQuery;
    canEdit?: (row: FinishedGoodsBatchVO) => boolean;
    canDelete?: (row: FinishedGoodsBatchVO) => boolean;
  }>(),
  {
    canEdit: () => true,
    canDelete: () => true
  }
);

const emit = defineEmits<{
  selectionChange: [selection: FinishedGoodsBatchVO[]];
  update: [row: FinishedGoodsBatchVO];
  delete: [row: FinishedGoodsBatchVO];
  pagination: [];
}>();

const actionColumnWidth = computed(() => {
  const hasTwoButtons = props.finishedGoodsBatchList.some((row) => props.canEdit(row) && props.canDelete(row));
  return hasTwoButtons ? 210 : 110;
});

/** 多选框选中数据 */
const handleSelectionChange = (selection: FinishedGoodsBatchVO[]) => {
  emit('selectionChange', selection);
};

/** 修改/查看按钮操作 */
const handleUpdate = (row: FinishedGoodsBatchVO) => {
  emit('update', row);
};

/** 删除按钮操作 */
const handleDelete = (row: FinishedGoodsBatchVO) => {
  emit('delete', row);
};

/** 分页事件 */
const handlePagination = () => {
  emit('pagination');
};
</script>
