<template>
  <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
    <div v-show="showSearch" class="mb-[10px]">
      <el-card shadow="hover" class="search-card">
        <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
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
              <el-option v-for="item in processorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Processor Name" prop="processorName">
            <!-- <el-select
              v-model="queryParams.processorName"
              filterable
              remote
              reserve-keyword
              placeholder="Please input Processor Name"
              :remote-method="processorNameRemoteMethod"
              :loading="processorNameLoading"
              :debounce="300"
              clearable
            >
              <el-option
                v-for="item in processorNameOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select> -->
            <el-input prefix-icon="Search" v-model="queryParams.processorName" placeholder="Please input Processor Name" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <!-- <el-form-item label="Processor Type" prop="processorType">
            <el-select v-model="queryParams.processorType" placeholder="请选择Processor Type" clearable >
              <el-option v-for="dict in t_agroprocessor_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item> -->
          <el-form-item label="Registration Number" prop="registrationNumber">
            <!-- <el-select
              v-model="queryParams.registrationNumber"
              filterable
              remote
              reserve-keyword
              placeholder="Please input Registration Number"
              :remote-method="registrationNumberRemoteMethod"
              :loading="registrationNumberLoading"
              :debounce="300"
              clearable
            >
              <el-option
                v-for="item in registrationNumberOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select> -->
            <el-input v-model="queryParams.registrationNumber" placeholder="Please input Registration Number" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Tin Number" prop="tinNumber">
            <!-- <el-select
              v-model="queryParams.tinNumber"
              filterable
              remote
              reserve-keyword
              placeholder="Please input Tin Number"
              :remote-method="tinNumberRemoteMethod"
              :loading="tinNumberLoading"
              :debounce="300"
              clearable
            >
              <el-option
                v-for="item in tinNumberOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select> -->
            <el-input v-model="queryParams.tinNumber" placeholder="Please input Tin Number" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <!-- <el-form-item label="Ownership Type" prop="ownershipType">
            <el-select v-model="queryParams.ownershipType" placeholder="请选择Ownership Type" clearable >
              <el-option v-for="dict in ownership_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item> -->
          <!--
          <el-form-item label="Region" prop="region">
            <el-input v-model="queryParams.region" placeholder="请输入Region" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Zone" prop="zone">
            <el-input v-model="queryParams.zone" placeholder="请输入Zone" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Woreda" prop="woreda">
            <el-input v-model="queryParams.woreda" placeholder="请输入Woreda" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Latitude" prop="gpsLat">
            <el-input v-model="queryParams.gpsLat" placeholder="请输入Latitude" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Longitude" prop="gpsLong">
            <el-input v-model="queryParams.gpsLong" placeholder="请输入Longitude" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Designed capacity (kg/day)" prop="processingCapacityPerDay">
            <el-input v-model="queryParams.processingCapacityPerDay" placeholder="请输入Designed capacity (kg/day)" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Technology Level" prop="technologyLevel">
            <el-select v-model="queryParams.technologyLevel" placeholder="请选择Technology Level" clearable >
              <el-option v-for="dict in technology_level" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="Approving authority user ID" prop="approvedBy">
            <el-input v-model="queryParams.approvedBy" placeholder="请输入Approving authority user ID" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="审批意见" prop="approvedComment">
            <el-input v-model="queryParams.approvedComment" placeholder="请输入审批意见" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Approval date" prop="approvedAt">
            <el-date-picker clearable
              v-model="queryParams.approvedAt"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择Approval date"
            />

          </el-form-item>
           -->
          <el-form-item class="search-actions">
            <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
            <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </transition>
</template>

<script setup name="AgroprocessorSearch" lang="ts">
import { AgroprocessorQuery, AgroprocessorVO } from '@/api/demo/agroprocessor/types';
import { listAgroprocessor } from '@/api/demo/agroprocessor/index';

const props = defineProps<{
  showSearch: boolean;
  queryParams: AgroprocessorQuery;
  agroprocessorAllList: AgroprocessorVO[];
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const queryFormRef = ref<ElFormInstance>();

const processorIdOptions = ref<any[]>([]);
const processorIdLoading = ref(false);
const processorIdRemoteMethod = async (query: string) => {
  if (query) {
    processorIdLoading.value = true;
    try {
      const response = await listAgroprocessor({ processorId: query } as AgroprocessorQuery);
      const data = response.rows || [];
      processorIdOptions.value = [...new Set(data.map((item) => item.processorId))].map((item) => ({
        value: item,
        label: item
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

const processorNameOptions = ref<any[]>([]);
const processorNameLoading = ref(false);
const processorNameRemoteMethod = async (query: string) => {
  if (query) {
    processorNameLoading.value = true;
    try {
      const response = await listAgroprocessor({ processorName: query } as AgroprocessorQuery);
      const data = response.rows || [];
      processorNameOptions.value = [...new Set(data.map((item) => item.processorName))].map((item) => ({
        value: item,
        label: item
      }));
    } catch (error) {
      console.error('查询 Processor Name 失败:', error);
      processorNameOptions.value = [];
    } finally {
      processorNameLoading.value = false;
    }
  } else {
    processorNameOptions.value = [];
  }
};

const registrationNumberOptions = ref<any[]>([]);
const registrationNumberLoading = ref(false);
const registrationNumberRemoteMethod = async (query: string) => {
  if (query) {
    registrationNumberLoading.value = true;
    try {
      const response = await listAgroprocessor({ registrationNumber: query } as AgroprocessorQuery);
      const data = response.rows || [];
      registrationNumberOptions.value = [...new Set(data.map((item) => item.registrationNumber))].map((item) => ({
        value: item,
        label: item
      }));
    } catch (error) {
      console.error('查询 Registration Number 失败:', error);
      registrationNumberOptions.value = [];
    } finally {
      registrationNumberLoading.value = false;
    }
  } else {
    registrationNumberOptions.value = [];
  }
};

const tinNumberOptions = ref<any[]>([]);
const tinNumberLoading = ref(false);
const tinNumberRemoteMethod = async (query: string) => {
  if (query) {
    tinNumberLoading.value = true;
    try {
      const response = await listAgroprocessor({ tinNumber: query } as AgroprocessorQuery);
      const data = response.rows || [];
      tinNumberOptions.value = [...new Set(data.map((item) => item.tinNumber))].map((item) => ({
        value: item,
        label: item
      }));
    } catch (error) {
      console.error('查询 Tin Number 失败:', error);
      tinNumberOptions.value = [];
    } finally {
      tinNumberLoading.value = false;
    }
  } else {
    tinNumberOptions.value = [];
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
