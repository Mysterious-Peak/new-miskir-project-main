import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WarehouseMasterVO, WarehouseMasterForm, WarehouseMasterQuery } from '@/api/demo/warehouseMaster/types';

/**
 * 查询仓库主数据列表
 * @param query
 * @returns {*}
 */

export const listWarehouseMaster = (query?: WarehouseMasterQuery): AxiosPromise<WarehouseMasterVO[]> => {
  return request({
    url: '/demo/warehouseMaster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询仓库主数据详细
 * @param id
 */
export const getWarehouseMaster = (id: string | number): AxiosPromise<WarehouseMasterVO> => {
  return request({
    url: '/demo/warehouseMaster/' + id,
    method: 'get'
  });
};

/**
 * 新增仓库主数据
 * @param data
 */
export const addWarehouseMaster = (data: WarehouseMasterForm) => {
  return request({
    url: '/demo/warehouseMaster',
    method: 'post',
    data: data
  });
};

/**
 * 修改仓库主数据
 * @param data
 */
export const updateWarehouseMaster = (data: WarehouseMasterForm) => {
  return request({
    url: '/demo/warehouseMaster',
    method: 'put',
    data: data
  });
};

/**
 * 删除仓库主数据
 * @param id
 */
export const delWarehouseMaster = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/warehouseMaster/' + id,
    method: 'delete'
  });
};
