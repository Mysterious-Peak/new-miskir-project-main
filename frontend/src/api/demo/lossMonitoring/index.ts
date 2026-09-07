import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LossMonitoringVO, LossMonitoringForm, LossMonitoringQuery } from '@/api/demo/lossMonitoring/types';

/**
 * 查询损耗监控列表
 * @param query
 * @returns {*}
 */

export const listLossMonitoring = (query?: LossMonitoringQuery): AxiosPromise<LossMonitoringVO[]> => {
  return request({
    url: '/demo/lossMonitoring/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询损耗监控详细
 * @param id
 */
export const getLossMonitoring = (id: string | number): AxiosPromise<LossMonitoringVO> => {
  return request({
    url: '/demo/lossMonitoring/' + id,
    method: 'get'
  });
};

/**
 * 新增损耗监控
 * @param data
 */
export const addLossMonitoring = (data: LossMonitoringForm) => {
  return request({
    url: '/demo/lossMonitoring',
    method: 'post',
    data: data
  });
};

/**
 * 修改损耗监控
 * @param data
 */
export const updateLossMonitoring = (data: LossMonitoringForm) => {
  return request({
    url: '/demo/lossMonitoring',
    method: 'put',
    data: data
  });
};

/**
 * 删除损耗监控
 * @param id
 */
export const delLossMonitoring = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/lossMonitoring/' + id,
    method: 'delete'
  });
};
