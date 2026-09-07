import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IrrigationTypeMasterVO, IrrigationTypeMasterForm, IrrigationTypeMasterQuery } from '@/api/demo/irrigationTypeMaster/types';

/**
 * 查询灌溉类型主数据列表
 * @param query
 * @returns {*}
 */

export const listIrrigationTypeMaster = (query?: IrrigationTypeMasterQuery): AxiosPromise<IrrigationTypeMasterVO[]> => {
  return request({
    url: '/demo/irrigationTypeMaster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询灌溉类型主数据详细
 * @param id
 */
export const getIrrigationTypeMaster = (id: string | number): AxiosPromise<IrrigationTypeMasterVO> => {
  return request({
    url: '/demo/irrigationTypeMaster/' + id,
    method: 'get'
  });
};

/**
 * 新增灌溉类型主数据
 * @param data
 */
export const addIrrigationTypeMaster = (data: IrrigationTypeMasterForm) => {
  return request({
    url: '/demo/irrigationTypeMaster',
    method: 'post',
    data: data
  });
};

/**
 * 修改灌溉类型主数据
 * @param data
 */
export const updateIrrigationTypeMaster = (data: IrrigationTypeMasterForm) => {
  return request({
    url: '/demo/irrigationTypeMaster',
    method: 'put',
    data: data
  });
};

/**
 * 删除灌溉类型主数据
 * @param id
 */
export const delIrrigationTypeMaster = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/irrigationTypeMaster/' + id,
    method: 'delete'
  });
};
