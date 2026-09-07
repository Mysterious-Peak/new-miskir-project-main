import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BatchInputVO, BatchInputForm, BatchInputQuery } from '@/api/demo/batchInput/types';

/**
 * 查询生产批次与原料入厂的投入关系列表
 * @param query
 * @returns {*}
 */

export const listBatchInput = (query?: BatchInputQuery): AxiosPromise<BatchInputVO[]> => {
  return request({
    url: '/demo/batchInput/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询生产批次与原料入厂的投入关系详细
 * @param batchInputLinkId
 */
export const getBatchInput = (batchInputLinkId: string | number): AxiosPromise<BatchInputVO> => {
  return request({
    url: '/demo/batchInput/' + batchInputLinkId,
    method: 'get'
  });
};

/**
 * 新增生产批次与原料入厂的投入关系
 * @param data
 */
export const addBatchInput = (data: BatchInputForm) => {
  return request({
    url: '/demo/batchInput',
    method: 'post',
    data: data
  });
};

/**
 * 修改生产批次与原料入厂的投入关系
 * @param data
 */
export const updateBatchInput = (data: BatchInputForm) => {
  return request({
    url: '/demo/batchInput',
    method: 'put',
    data: data
  });
};

/**
 * 删除生产批次与原料入厂的投入关系
 * @param batchInputLinkId
 */
export const delBatchInput = (batchInputLinkId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/batchInput/' + batchInputLinkId,
    method: 'delete'
  });
};
