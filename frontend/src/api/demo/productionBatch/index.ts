import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  ProductionBatchVO,
  ProductionBatchForm,
  ProductionBatchQuery,
  ProductionBatchUpdateForm,
  ProductionBatchWithStepsForm,
  ProductionBatchWithQualityInspectionVO,
  ProductionBatchWithQualityInspectionQuery
} from '@/api/demo/productionBatch/types';

/**
 * 查询生产批次主列表
 * @param query
 * @returns {*}
 */

export const listProductionBatch = (query?: ProductionBatchQuery): AxiosPromise<ProductionBatchVO[]> => {
  return request({
    url: '/demo/productionBatch/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询生产批次主详细
 * @param productionBatchId
 */
export const getProductionBatch = (productionBatchId: string | number): AxiosPromise<ProductionBatchVO> => {
  return request({
    url: '/demo/productionBatch/' + productionBatchId,
    method: 'get'
  });
};

/**
 * 新增生产批次主
 * @param data
 */
export const addProductionBatch = (data: ProductionBatchForm) => {
  return request({
    url: '/demo/productionBatch',
    method: 'post',
    data: data
  });
};

/**
 * 修改生产批次主（可携带 approvalTaskForm，后端同一事务更新批次与审批任务）
 * @param data
 */
export const updateProductionBatch = (data: ProductionBatchUpdateForm) => {
  return request({
    url: '/demo/productionBatch',
    method: 'put',
    data: data
  });
};

/**
 * 删除生产批次主
 * @param productionBatchId
 */
export const delProductionBatch = (productionBatchId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/productionBatch/' + productionBatchId,
    method: 'delete'
  });
};

/**
 * 同时保存生产批次和处理步骤
 * @param data
 */
export const saveProductionBatchWithSteps = (data: ProductionBatchWithStepsForm): AxiosPromise<ProductionBatchVO> => {
  return request({
    url: '/demo/productionBatch/withSteps',
    method: 'post',
    data: data
  });
};

/**
 * 同时更新生产批次和处理步骤
 * @param data
 */
export const updateProductionBatchWithSteps = (data: ProductionBatchWithStepsForm): AxiosPromise<ProductionBatchVO> => {
  return request({
    url: '/demo/productionBatch/withSteps',
    method: 'put',
    data: data
  });
};

/**
 * 查询生产批次和质量检查关联数据列表
 * @param query
 * @returns {*}
 */
export const listProductionBatchWithQualityInspection = (
  query?: ProductionBatchWithQualityInspectionQuery
): AxiosPromise<ProductionBatchWithQualityInspectionVO[]> => {
  return request({
    url: '/demo/productionBatch/listWithInspection',
    method: 'get',
    params: query
  });
};
