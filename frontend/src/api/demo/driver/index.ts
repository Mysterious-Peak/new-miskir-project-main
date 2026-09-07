import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DriverVO, DriverForm, DriverQuery } from '@/api/demo/driver/types';

/**
 * 查询司机主列表
 * @param query
 * @returns {*}
 */

export const listDriver = (query?: DriverQuery): AxiosPromise<DriverVO[]> => {
  return request({
    url: '/demo/driver/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询司机主详细
 * @param driverId
 */
export const getDriver = (driverId: string | number): AxiosPromise<DriverVO> => {
  return request({
    url: '/demo/driver/' + driverId,
    method: 'get'
  });
};

/**
 * 新增司机主
 * @param data
 */
export const addDriver = (data: DriverForm) => {
  return request({
    url: '/demo/driver',
    method: 'post',
    data: data
  });
};

/**
 * 修改司机主
 * @param data
 */
export const updateDriver = (data: DriverForm) => {
  return request({
    url: '/demo/driver',
    method: 'put',
    data: data
  });
};

/**
 * 删除司机主
 * @param driverId
 */
export const delDriver = (driverId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/driver/' + driverId,
    method: 'delete'
  });
};
