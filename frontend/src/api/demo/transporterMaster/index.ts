import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TransporterMasterVO, TransporterMasterForm, TransporterMasterQuery } from '@/api/demo/transporterMaster/types';

/**
 * 查询承运商主数据列表
 * @param query
 * @returns {*}
 */

export const listTransporterMaster = (query?: TransporterMasterQuery): AxiosPromise<TransporterMasterVO[]> => {
  return request({
    url: '/demo/transporterMaster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询承运商主数据详细
 * @param id
 */
export const getTransporterMaster = (id: string | number): AxiosPromise<TransporterMasterVO> => {
  return request({
    url: '/demo/transporterMaster/' + id,
    method: 'get'
  });
};

/**
 * 新增承运商主数据
 * @param data
 */
export const addTransporterMaster = (data: TransporterMasterForm) => {
  return request({
    url: '/demo/transporterMaster',
    method: 'post',
    data: data
  });
};

/**
 * 修改承运商主数据
 * @param data
 */
export const updateTransporterMaster = (data: TransporterMasterForm) => {
  return request({
    url: '/demo/transporterMaster',
    method: 'put',
    data: data
  });
};

/**
 * 删除承运商主数据
 * @param id
 */
export const delTransporterMaster = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/transporterMaster/' + id,
    method: 'delete'
  });
};
