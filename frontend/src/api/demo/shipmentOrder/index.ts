import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ShipmentOrderVO, ShipmentOrderForm, ShipmentOrderQuery, ShipmentOrderCreateBatchForm } from '@/api/demo/shipmentOrder/types';

/**
 * 查询运输订单列表
 * @param query
 * @returns {*}
 */

export const listShipmentOrder = (query?: ShipmentOrderQuery): AxiosPromise<ShipmentOrderVO[]> => {
  return request({
    url: '/demo/shipmentOrder/list',
    method: 'get',
    params: query
  });
};

/**
 * Shipment ID 自动补全
 * @param query
 */
export const autoCompleteShipmentId = (query?: ShipmentOrderQuery): AxiosPromise<ShipmentOrderVO[]> => {
  return request({
    url: '/demo/shipmentOrder/autoComplete/shipmentId',
    method: 'get',
    params: query
  });
};

/**
 * 查询运输订单详细
 * @param shipmentId
 */
export const getShipmentOrder = (shipmentId: string | number): AxiosPromise<ShipmentOrderVO> => {
  return request({
    url: '/demo/shipmentOrder/batch/' + shipmentId,
    method: 'get'
  });
};

/**
 * 新增运输订单
 * @param data
 */
export const addShipmentOrder = (data: ShipmentOrderForm) => {
  return request({
    url: '/demo/shipmentOrder',
    method: 'post',
    data: data
  });
};

/**
 * 创建运输订单并分配批次（/demo/shipmentOrder/createBatch）
 * @param data
 */
export const createShipmentOrderWithBatch = (data: ShipmentOrderCreateBatchForm) => {
  return request({
    url: '/demo/shipmentOrder/createBatch',
    method: 'post',
    data
  });
};

/**
 * 修改运输订单
 * @param data
 */
export const updateShipmentOrder = (data: ShipmentOrderForm) => {
  return request({
    url: '/demo/shipmentOrder',
    method: 'put',
    data: data
  });
};

/**
 * 删除运输订单
 * @param shipmentId
 */
export const delShipmentOrder = (shipmentId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/shipmentOrder/' + shipmentId,
    method: 'delete'
  });
};

/**
 * 添加运输订单批次链接
 * @param data
 */
export const addShipmentOrderBatchLink = (data: { shipmentId: string | number; finishedBatchId: string; quantity: number }) => {
  return request({
    url: '/demo/shipmentOrder/batch/add',
    method: 'post',
    data
  });
};

/**
 * 删除运输订单批次链接
 * @param shipmentBatchLinkId
 */
export const delShipmentOrderBatchLink = (shipmentBatchLinkId: string | number) => {
  return request({
    url: '/demo/shipmentOrder/batch/' + shipmentBatchLinkId,
    method: 'delete'
  });
};

/**
 * 编辑运输订单批次链接
 * @param data
 */
export const updateShipmentOrderBatchLink = (data: { shipmentBatchLinkId: string | number; finishedBatchId: string; quantity: number }) => {
  return request({
    url: '/demo/shipmentOrder/batch/edit',
    method: 'put',
    data
  });
};

/**
 * 获取运输订单及其关联的产后批次信息
 * @param shipmentId
 * @returns
 */
export const getShipmentOrderBatch = (shipmentId: string | number): AxiosPromise<ShipmentOrderVO> => {
  return request({
    url: '/demo/shipmentOrder/batch/' + shipmentId,
    method: 'get'
  });
};
