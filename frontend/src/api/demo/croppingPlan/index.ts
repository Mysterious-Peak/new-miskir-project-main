import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CroppingPlanVO, CroppingPlanForm, CroppingPlanQuery } from '@/api/demo/croppingPlan/types';

/**
 * 查询种植计划列表
 * @param query
 * @returns {*}
 */

export const listCroppingPlan = (query?: CroppingPlanQuery): AxiosPromise<CroppingPlanVO[]> => {
  return request({
    url: '/demo/croppingPlan/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询种植计划详细
 * @param planId
 */
export const getCroppingPlan = (planId: string | number): AxiosPromise<CroppingPlanVO> => {
  return request({
    url: '/demo/croppingPlan/' + planId,
    method: 'get'
  });
};

/**
 * 新增种植计划
 * @param data
 */
export const addCroppingPlan = (data: CroppingPlanForm) => {
  return request({
    url: '/demo/croppingPlan',
    method: 'post',
    data: data
  });
};

/**
 * 修改种植计划
 * @param data
 */
export const updateCroppingPlan = (data: CroppingPlanForm) => {
  return request({
    url: '/demo/croppingPlan',
    method: 'put',
    data: data
  });
};

/**
 * 删除种植计划
 * @param planId
 */
export const delCroppingPlan = (planId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/croppingPlan/' + planId,
    method: 'delete'
  });
};
