<template>
  <el-table v-loading="loading" border stripe :data="agroprocessorList" @selection-change="handleSelectionChange">
    <!-- <el-table-column type="selection" width="55" align="center" /> -->
    <el-table-column label="Processor ID" align="center" prop="processorId" v-if="true" :min-width="getColumnWidth('Processor ID')" />
    <el-table-column label="Processor Name" align="center" prop="processorName" :min-width="getColumnWidth('Processor Name')" />
    <el-table-column label="Processor Type" align="center" prop="processorType" :min-width="getColumnWidth('Processor Type')">
      <template #default="scope">
        <dict-tag :options="t_agroprocessor_type" :value="scope.row.processorType" />
      </template>
    </el-table-column>
    <el-table-column label="Registration Number" align="center" prop="registrationNumber" :min-width="getColumnWidth('Registration Number')" />
    <el-table-column label="Tin Number" align="center" prop="tinNumber" :min-width="getColumnWidth('Tin Number')" />
    <el-table-column label="Ownership Type" align="center" prop="ownershipType" :min-width="getColumnWidth('Ownership Type')">
      <template #default="scope">
        <dict-tag :options="ownership_type" :value="scope.row.ownershipType" />
      </template>
    </el-table-column>
    <el-table-column label="Region" align="center" prop="region" :min-width="getColumnWidth('Tigray Region')">
      <template #default="scope">
        <dict-tag :options="region_options" :value="scope.row.region" />
      </template>
    </el-table-column>
    <el-table-column label="Zone" align="center" prop="zone" :min-width="getColumnWidth('Zone')" />
    <el-table-column label="Woreda" align="center" prop="woreda" :min-width="getColumnWidth('Woreda')" />
    <el-table-column label="Latitude" align="center" prop="gpsLat" :min-width="getColumnWidth('Latitude')" />
    <el-table-column label="Longitude" align="center" prop="gpsLong" :min-width="getColumnWidth('Longitude')" />

    <el-table-column
      label="Designed capacity (kg/day)"
      align="center"
      prop="processingCapacityPerDay"
      :min-width="getColumnWidth('Designed capacity (kg/day)')"
    />
    <el-table-column label="Technology Level" align="center" prop="technologyLevel" :min-width="getColumnWidth('Technology Level')">
      <template #default="scope">
        <dict-tag :options="technology_level" :value="scope.row.technologyLevel" />
      </template>
    </el-table-column>
    <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
      <template #default="scope">
        <el-tag>
          {{
            scope.row.status === String(AgroprocessorStatus.NeedRevision)
              ? scope.row.approvedComment
                ? props.AgroprocessorStatus[scope.row.status as AgroprocessorStatus]
                : 'NeedRevision'
              : props.AgroprocessorStatus[scope.row.status as AgroprocessorStatus]
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
    <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />

    <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" :width="actionColumnWidth">
      <template #default="scope">
        <el-button
          v-if="!canEdit(scope.row)"
          class="table-action-btn table-check-btn"
          icon="View"
          @click="handleUpdate(scope.row)"
          v-hasPermi="['demo:agroprocessor:edit']"
          >View</el-button
        >
        <template v-else>
          <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)" v-hasPermi="['demo:agroprocessor:edit']"
            >Edit</el-button
          >
          <el-button
            v-if="canDelete(scope.row)"
            class="table-action-btn table-delete-btn"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['demo:agroprocessor:remove']"
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

<script setup name="AgroprocessorList" lang="ts">
import { AgroprocessorVO, AgroprocessorQuery } from '@/api/demo/agroprocessor/types';
import { AgroprocessorStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const props = withDefaults(
  defineProps<{
    loading: boolean;
    agroprocessorList: AgroprocessorVO[];
    t_agroprocessor_type: any[];
    ownership_type: any[];
    region_options: any[];
    technology_level: any[];
    AgroprocessorStatus: typeof AgroprocessorStatus;
    total: number;
    queryParams: AgroprocessorQuery;
    canEdit?: (row: AgroprocessorVO) => boolean;
    canDelete?: (row: AgroprocessorVO) => boolean;
  }>(),
  {
    canEdit: () => true,
    canDelete: () => true
  }
);

const emit = defineEmits<{
  selectionChange: [selection: AgroprocessorVO[]];
  update: [row: AgroprocessorVO];
  delete: [row: AgroprocessorVO];
  pagination: [];
}>();

const actionColumnWidth = computed(() => {
  const hasTwoButtons = props.agroprocessorList.some((row) => props.canEdit(row) && props.canDelete(row));
  return hasTwoButtons ? 210 : 110;
});

/** 多选框选中数据 */
const handleSelectionChange = (selection: AgroprocessorVO[]) => {
  emit('selectionChange', selection);
};

/** 修改/查看按钮操作 */
const handleUpdate = (row: AgroprocessorVO) => {
  emit('update', row);
};

/** 删除按钮操作 */
const handleDelete = (row: AgroprocessorVO) => {
  emit('delete', row);
};

/** 分页事件 */
const handlePagination = () => {
  emit('pagination');
};
</script>
