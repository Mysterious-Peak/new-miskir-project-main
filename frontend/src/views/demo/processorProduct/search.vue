<template>
  <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
    <div v-show="showSearch" class="mb-[10px]">
      <el-card shadow="hover" class="search-card">
        <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
          <el-form-item label="Product ID" prop="productId">
            <el-select
              v-model="queryParams.productId"
              filterable
              remote
              reserve-keyword
              placeholder="Please input Product ID"
              :remote-method="productIdRemoteMethod"
              :loading="productIdLoading"
              :debounce="300"
              clearable
            >
              <el-option
                v-for="item in productIdOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Processor ID" prop="processorId">
            <el-select
              v-model="queryParams.processorId"
              filterable
              remote
              reserve-keyword
              placeholder="Please input Processor ID"
              :remote-method="processorIdRemoteMethod"
              :loading="processorIdLoading"
              :debounce="300"
              clearable
            >
              <el-option
                v-for="item in processorIdOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Product Name" prop="productName">
            <!-- <el-select
              v-model="queryParams.productName"
              filterable
              remote
              reserve-keyword
              placeholder="Please input Product Name"
              :remote-method="productNameRemoteMethod"
              :loading="productNameLoading"
              :debounce="300"
              clearable
            >
              <el-option
                v-for="item in productNameOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select> -->
            <el-input prefix-icon="Search" v-model="queryParams.productName" placeholder="Please input Registration Number" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <!-- <el-form-item label="Product Category" prop="productCategory">
            <el-select v-model="queryParams.productCategory" placeholder="Please select Product Category" clearable >
              <el-option v-for="dict in t_agroprocessor_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="Standard Reference" prop="standardReference">
            <el-input v-model="queryParams.standardReference" placeholder="Please input Standard Reference" clearable @keyup.enter="handleQuery" />
          </el-form-item> -->
          <!-- <el-form-item label="Packaging Type" prop="packagingType">
            <el-input v-model="queryParams.packagingType" placeholder="Please input Packaging Type" clearable @keyup.enter="handleQuery" />
          </el-form-item> -->
          <!-- <el-form-item label="Export Eligible" prop="exportEligible">
            <el-select v-model="queryParams.exportEligible" placeholder="Please select Export Eligible" clearable >
              <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item> -->
          <el-form-item class="search-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
            <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </transition>
</template>

<script setup name="ProcessorProductSearch" lang="ts">
import { ProcessorProductQuery, ProcessorProductVO } from '@/api/demo/processorProduct/types';
import { listProcessorProduct } from '@/api/demo/processorProduct/index';
import request from '@/utils/request';

const props = defineProps<{
  showSearch: boolean;
  queryParams: ProcessorProductQuery;
  processorProductAllList: ProcessorProductVO[];
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { t_agroprocessor_type, sys_yes_no } = toRefs<any>(proxy?.useDict('t_agroprocessor_type', 'sys_yes_no'));
const queryFormRef = ref<ElFormInstance>();

const productIdOptions = ref<any[]>([]);
const productIdLoading = ref(false);
const productIdRemoteMethod = async (query: string) => {
  if (query) {
    productIdLoading.value = true;
    try {
      const response = await listProcessorProduct({ productId: query } as ProcessorProductQuery);
      const data = response.rows || [];
      productIdOptions.value = [
        ...new Set(data.map((item) => item.productId))
      ].map((item) => ({
        value: item,
        label: item
      }));
    } catch (error) {
      console.error('查询 Product ID 失败:', error);
      productIdOptions.value = [];
    } finally {
      productIdLoading.value = false;
    }
  } else {
    productIdOptions.value = [];
  }
};

const processorIdOptions = ref<any[]>([]);
const processorIdLoading = ref(false);
const processorIdRemoteMethod = async (query: string) => {
  if (query) {
    processorIdLoading.value = true;
    try {
      const res = await request({
        url: '/demo/processorProduct/autoComplete/processorId',
        method: 'get',
        params: { processorName: query }
      });
      const data = res.data || [];
      processorIdOptions.value = data.map((item: any) => ({
        value: item.processorId,
        label: item.processorName ? `${item.processorId}` : item.processorId
      }));
    } catch (error) {
      console.error('查询 Processor ID 失败:', error);
      processorIdOptions.value = [];
    } finally {
      processorIdLoading.value = false;
    }
  } else {
    processorIdOptions.value = [];
  }
};

const productNameOptions = ref<any[]>([]);
const productNameLoading = ref(false);
const productNameRemoteMethod = async (query: string) => {
  if (query) {
    productNameLoading.value = true;
    try {
      const response = await listProcessorProduct({ productName: query } as ProcessorProductQuery);
      const data = response.rows || [];
      productNameOptions.value = [
        ...new Set(data.map((item) => item.productName))
      ].map((item) => ({
        value: item,
        label: item
      }));
    } catch (error) {
      console.error('查询 Product Name 失败:', error);
      productNameOptions.value = [];
    } finally {
      productNameLoading.value = false;
    }
  } else {
    productNameOptions.value = [];
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
