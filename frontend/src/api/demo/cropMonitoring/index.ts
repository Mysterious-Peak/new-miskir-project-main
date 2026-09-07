import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CropMonitoringVO, CropMonitoringForm, CropMonitoringQuery } from '@/api/demo/cropMonitoring/types';

/**
 * 查询作物监测记录列表
 * @param query
 * @returns {*}
 */

export const listCropMonitoring = (query?: CropMonitoringQuery): AxiosPromise<CropMonitoringVO[]> => {
  return request({
    url: '/demo/cropMonitoring/list',
    method: 'get',
    params: query
  });
};

export const listCropMonitoringApprove = (query?: CropMonitoringQuery): AxiosPromise<CropMonitoringVO[]> => {
  return request({
    url: '/demo/cropMonitoring/list/approved',
    method: 'get',
    params: query
  });
};

/**
 * 查询作物监测记录详细
 * @param monitorId
 */
export const getCropMonitoring = (monitorId: string | number): AxiosPromise<CropMonitoringVO> => {
  return request({
    url: '/demo/cropMonitoring/' + monitorId,
    method: 'get'
  });
};

/**
 * 新增作物监测记录
 * @param data
 */
export const addCropMonitoring = (data: CropMonitoringForm) => {
  return request({
    url: '/demo/cropMonitoring',
    method: 'post',
    data: data
  });
};

/**
 * 修改作物监测记录
 * @param data
 */
export const updateCropMonitoring = (data: CropMonitoringForm) => {
  return request({
    url: '/demo/cropMonitoring',
    method: 'put',
    data: data
  });
};

/**
 * 删除作物监测记录
 * @param monitorId
 */
export const delCropMonitoring = (monitorId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/cropMonitoring/' + monitorId,
    method: 'delete'
  });
};
