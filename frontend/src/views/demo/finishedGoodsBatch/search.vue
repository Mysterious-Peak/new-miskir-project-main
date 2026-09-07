<template>
  <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
    <div v-show="showSearch" class="mb-[10px]">
      <el-card shadow="hover" class="search-card">
        <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
          <el-form-item label="Finished Batch ID" prop="finishedBatchId">
            <el-autocomplete
              v-model="queryParams.finishedBatchId"
              :fetch-suggestions="queryFinishedBatchId as any"
              :trigger-on-focus="false"
              placeholder="Please input Finished Batch ID"
              :loading="finishedBatchIdLoading"
              clearable
              @select="handleFinishedBatchIdSelect"
              @keyup.enter="handleQuery"
            >
              <template #default="{ item }">
                <div>
                  <span>{{ item.value }}</span>
                  <span v-if="item.value" style="color: #8492a6; font-size: 13px; margin-left: 8px"> </span>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="Production Batch ID" prop="productionBatchId">
            <el-autocomplete
              v-model="queryParams.productionBatchId"
              :fetch-suggestions="queryProductionBatchId as any"
              :trigger-on-focus="false"
              placeholder="Please input Production Batch ID"
              :loading="productionBatchIdLoading"
              clearable
              @select="handleProductionBatchIdSelect"
              @keyup.enter="handleQuery"
            >
              <template #default="{ item }">
                <div>
                  <span>{{ item.value }}</span>
                  <span v-if="item.finishedBatchId" style="color: #8492a6; font-size: 13px; margin-left: 8px"> </span>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="Warehouse Code" prop="warehouseId">
            <el-autocomplete
              v-model="queryParams.warehouseId"
              :fetch-suggestions="queryWarehouseId as any"
              :trigger-on-focus="false"
              placeholder="Please input Warehouse Code"
              :loading="warehouseIdLoading"
              clearable
              @keyup.enter="handleQuery"
            >
              <template #default="{ item }">
                <div>
                  <span>{{ item.label || item.value }}</span>
                  <span v-if="item.id" style="color: #8492a6; font-size: 13px; margin-left: 8px"> ({{ item.id }}) </span>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item class="search-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
            <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </transition>
</template>

<script setup name="FinishedGoodsBatchSearch" lang="ts">
import { listFinishedGoodsBatch, getFinishedGoodsBatch } from '@/api/demo/finishedGoodsBatch';
import { FinishedGoodsBatchQuery, FinishedGoodsBatchVO } from '@/api/demo/finishedGoodsBatch/types';

const props = defineProps<{
  showSearch: boolean;
  queryParams: FinishedGoodsBatchQuery;
  warehouseList: any[];
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const queryFormRef = ref<ElFormInstance>();

/** Finished Batch ID 自动完成加载状态 */
const finishedBatchIdLoading = ref(false);

/** Production Batch ID 自动完成加载状态 */
const productionBatchIdLoading = ref(false);

/** Warehouse ID 自动完成加载状态 */
const warehouseIdLoading = ref(false);

/**
 * Finished Batch ID 远程建议：使用 list 接口按 finishedBatchId 查询
 */
const queryFinishedBatchId = (queryString: string, cb: (suggestions: any[]) => void) => {
  if (!queryString || typeof queryString !== 'string') {
    cb([]);
    return;
  }
  finishedBatchIdLoading.value = true;
  listFinishedGoodsBatch({
    finishedBatchId: queryString,
    pageNum: 1,
    pageSize: 20
  } as FinishedGoodsBatchQuery)
    .then((res: any) => {
      const data = res?.rows ?? [];
      const suggestions = data.map((item: FinishedGoodsBatchVO) => ({
        value: item.finishedBatchId,
        finishedBatchId: item.finishedBatchId,
        productionBatchId: item.productionBatchId,
        warehouseId: item.warehouseId
      }));
      cb(suggestions);
    })
    .catch(() => {
      cb([]);
    })
    .finally(() => {
      finishedBatchIdLoading.value = false;
    });
};

/**
 * 选择 Finished Batch ID 建议项后，使用 getInfo 接口拉取详情并回填查询条件
 */
const handleFinishedBatchIdSelect = async (item: { value: string | number; finishedBatchId: string | number }) => {
  if (item?.finishedBatchId == null) return;
  try {
    const vo = await getFinishedGoodsBatch(item.finishedBatchId);
    if (vo?.data) {
      const data = vo.data as FinishedGoodsBatchVO;
      props.queryParams.finishedBatchId = data.finishedBatchId;
      props.queryParams.productionBatchId = data.productionBatchId;
      if (data.warehouseId != null) props.queryParams.warehouseId = data.warehouseId;
    }
  } catch {
    // 接口失败时仅保留已选中的 finishedBatchId
  }
};

/**
 * Production Batch ID 远程建议：使用 list 接口按 productionBatchId 查询
 */
const queryProductionBatchId = (queryString: string, cb: (suggestions: any[]) => void) => {
  if (!queryString || typeof queryString !== 'string') {
    cb([]);
    return;
  }
  productionBatchIdLoading.value = true;
  listFinishedGoodsBatch({
    productionBatchId: queryString,
    pageNum: 1,
    pageSize: 20
  } as FinishedGoodsBatchQuery)
    .then((res: any) => {
      const data = res?.rows ?? [];
      const suggestions = data.map((item: FinishedGoodsBatchVO) => ({
        value: item.productionBatchId,
        finishedBatchId: item.finishedBatchId,
        productionBatchId: item.productionBatchId,
        warehouseId: item.warehouseId
      }));
      cb(suggestions);
    })
    .catch(() => {
      cb([]);
    })
    .finally(() => {
      productionBatchIdLoading.value = false;
    });
};

/**
 * 选择 Production Batch ID 建议项后，使用 getInfo 接口拉取详情并回填查询条件
 */
const handleProductionBatchIdSelect = async (item: { value: string | number; finishedBatchId: string | number }) => {
  if (item?.finishedBatchId == null) return;
  try {
    const vo = await getFinishedGoodsBatch(item.finishedBatchId);
    if (vo?.data) {
      const data = vo.data as FinishedGoodsBatchVO;
      props.queryParams.finishedBatchId = data.finishedBatchId;
      props.queryParams.productionBatchId = data.productionBatchId;
      if (data.warehouseId != null) props.queryParams.warehouseId = data.warehouseId;
    }
  } catch {
    // 接口失败时仅保留已选中的 productionBatchId
  }
};

/**
 * Warehouse ID 本地建议：基于外部仓库缓存列表过滤
 */
const queryWarehouseId = (queryString: string, cb: (suggestions: any[]) => void) => {
  warehouseIdLoading.value = true;
  try {
    const q = (queryString || '').trim().toLowerCase();
    const source = Array.isArray(props.warehouseList) ? props.warehouseList : [];
    const filtered = source.filter((item: any) => {
      if (!q) return true;
      const idText = String(item?.id || '').toLowerCase();
      const codeText = String(item?.warehouseCode || '').toLowerCase();
      const nameText = String(item?.warehouseName || '').toLowerCase();
      return idText.includes(q) || codeText.includes(q) || nameText.includes(q);
    });
    const dedupMap = new Map<string, any>();
    filtered.forEach((item: any) => {
      const key = String(item?.id || '');
      if (!key || dedupMap.has(key)) return;
      dedupMap.set(key, {
        value: item.id,
        label: item.warehouseCode || item.warehouseName || item.id,
        id: item.id,
        warehouseCode: item.warehouseCode,
        warehouseName: item.warehouseName
      });
    });
    cb(Array.from(dedupMap.values()).slice(0, 20));
  } finally {
    warehouseIdLoading.value = false;
  }
};

/** 搜索按钮操作 */
const handleQuery = () => {
  emit('search');
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  emit('reset');
};
</script>
