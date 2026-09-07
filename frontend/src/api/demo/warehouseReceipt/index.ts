import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WarehouseReceiptVO, WarehouseReceiptForm, WarehouseReceiptQuery } from '@/api/demo/warehouseReceipt/types';

/**
 * 查询数字仓单列表
 * @param query
 * @returns {*}
 */

export const listWarehouseReceipt = (query?: WarehouseReceiptQuery): AxiosPromise<WarehouseReceiptVO[]> => {
  return request({
    url: '/demo/warehouseReceipt/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询数字仓单详细
 * @param id
 */
export const getWarehouseReceipt = (id: string | number): AxiosPromise<WarehouseReceiptVO> => {
  return request({
    url: '/demo/warehouseReceipt/' + id,
    method: 'get'
  });
};

/**
 * 新增数字仓单
 * @param data
 */
export const addWarehouseReceipt = (data: WarehouseReceiptForm) => {
  return request({
    url: '/demo/warehouseReceipt',
    method: 'post',
    data: data
  });
};

/**
 * 修改数字仓单
 * @param data
 */
export const updateWarehouseReceipt = (data: WarehouseReceiptForm) => {
  return request({
    url: '/demo/warehouseReceipt',
    method: 'put',
    data: data
  });
};

/**
 * 删除数字仓单
 * @param id
 */
export const delWarehouseReceipt = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/warehouseReceipt/' + id,
    method: 'delete'
  });
};
