import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WarehouseIntakeVO, WarehouseIntakeForm, WarehouseIntakeQuery } from '@/api/demo/warehouseIntake/types';

type RowsResponse<T = any> = {
  rows: T[];
  total?: number;
};

/**
 * 查询仓库入库列表
 * @param query
 * @returns {*}
 */

export const listWarehouseIntake = (query?: WarehouseIntakeQuery): AxiosPromise<WarehouseIntakeVO[]> => {
  return request({
    url: '/demo/warehouseIntake/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询仓库入库详细
 * @param id
 */
export const getWarehouseIntake = (id: string | number): AxiosPromise<WarehouseIntakeVO> => {
  return request({
    url: '/demo/warehouseIntake/' + id,
    method: 'get'
  });
};

/**
 * 新增仓库入库
 * @param data
 */
export const addWarehouseIntake = (data: WarehouseIntakeForm) => {
  return request({
    url: '/demo/warehouseIntake',
    method: 'post',
    data: data
  });
};

/**
 * 修改仓库入库
 * @param data
 */
export const updateWarehouseIntake = (data: WarehouseIntakeForm) => {
  return request({
    url: '/demo/warehouseIntake',
    method: 'put',
    data: data
  });
};

/**
 * 删除仓库入库
 * @param id
 */
export const delWarehouseIntake = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/warehouseIntake/' + id,
    method: 'delete'
  });
};

/**
 * 查询仓库入库列表
 * @param query
 * @returns {*}
 */

export const listExternalWarehouseList = (query?: Record<string, any>): Promise<RowsResponse<any>> => {
  return request({
    url: '/externalWarehouseList',
    method: 'get',
    params: query
  });
};
