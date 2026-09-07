import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { YieldEstimateVO, YieldEstimateForm, YieldEstimateQuery } from '@/api/demo/yieldEstimate/types';

/**
 * 查询产量估算列表
 * @param query
 * @returns {*}
 */

export const listYieldEstimate = (query?: YieldEstimateQuery): AxiosPromise<YieldEstimateVO[]> => {
  return request({
    url: '/demo/yieldEstimate/list',
    method: 'get',
    params: query
  });
};

export const listYieldEstimateApprove = (query?: YieldEstimateQuery): AxiosPromise<YieldEstimateVO[]> => {
  return request({
    url: '/demo/yieldEstimate/list/approved',
    method: 'get',
    params: query
  });
};

/**
 * 查询产量估算详细
 * @param estimateId
 */
export const getYieldEstimate = (estimateId: string | number): AxiosPromise<YieldEstimateVO> => {
  return request({
    url: '/demo/yieldEstimate/' + estimateId,
    method: 'get'
  });
};

/**
 * 新增产量估算
 * @param data
 */
export const addYieldEstimate = (data: YieldEstimateForm) => {
  return request({
    url: '/demo/yieldEstimate',
    method: 'post',
    data: data
  });
};

/**
 * 修改产量估算
 * @param data
 */
export const updateYieldEstimate = (data: YieldEstimateForm) => {
  return request({
    url: '/demo/yieldEstimate',
    method: 'put',
    data: data
  });
};

/**
 * 删除产量估算
 * @param estimateId
 */
export const delYieldEstimate = (estimateId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/yieldEstimate/' + estimateId,
    method: 'delete'
  });
};
