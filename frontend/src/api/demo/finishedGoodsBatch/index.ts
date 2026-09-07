import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FinishedGoodsBatchVO, FinishedGoodsBatchForm, FinishedGoodsBatchQuery } from '@/api/demo/finishedGoodsBatch/types';
import { WarehouseMasterVO } from '@/api/demo/warehouseMaster/types';

/**
 * 查询finishedGoodsBatch列表
 * @param query
 * @returns {*}
 */

export const listFinishedGoodsBatch = (query?: FinishedGoodsBatchQuery): AxiosPromise<FinishedGoodsBatchVO[]> => {
  return request({
    url: '/demo/finishedGoodsBatch/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询finishedGoodsBatch详细
 * @param finishedBatchId
 */
export const getFinishedGoodsBatch = (finishedBatchId: string | number): AxiosPromise<FinishedGoodsBatchVO> => {
  return request({
    url: '/demo/finishedGoodsBatch/' + finishedBatchId,
    method: 'get'
  });
};

/**
 * 新增finishedGoodsBatch
 * @param data
 */
export const addFinishedGoodsBatch = (data: FinishedGoodsBatchForm) => {
  return request({
    url: '/demo/finishedGoodsBatch',
    method: 'post',
    data: data
  });
};

/**
 * 修改finishedGoodsBatch
 * @param data
 */
export const updateFinishedGoodsBatch = (data: FinishedGoodsBatchForm) => {
  return request({
    url: '/demo/finishedGoodsBatch',
    method: 'put',
    data: data
  });
};

/**
 * 删除finishedGoodsBatch
 * @param finishedBatchId
 */
export const delFinishedGoodsBatch = (finishedBatchId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/finishedGoodsBatch/' + finishedBatchId,
    method: 'delete'
  });
};

/**
 * 获取唯一的仓库列表（用于自动完成）
 * 从成品批次表中取 unique 的 warehouseId，返回对应的 TWarehouseMasterVo 列表
 * @param query 查询条件（TFinishedGoodsBatchBo）
 */
export const autoCompleteWarehouseId = (query?: FinishedGoodsBatchQuery): AxiosPromise<WarehouseMasterVO[]> => {
  return request({
    url: '/demo/finishedGoodsBatch/autoComplete/warehouseId',
    method: 'get',
    params: query
  });
};
