import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TripVO, TripForm, TripQuery } from '@/api/demo/trip/types';

/**
 * 查询运输行程列表
 * @param query
 * @returns {*}
 */

export const listTrip = (query?: TripQuery): AxiosPromise<TripVO[]> => {
  return request({
    url: '/demo/trip/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询运输行程详细
 * @param tripId
 */
export const getTrip = (tripId: string | number): AxiosPromise<TripVO> => {
  return request({
    url: '/demo/trip/' + tripId,
    method: 'get'
  });
};

/**
 * 新增运输行程
 * @param data
 */
export const addTrip = (data: TripForm) => {
  return request({
    url: '/demo/trip',
    method: 'post',
    data: data
  });
};

/**
 * 修改运输行程
 * @param data
 */
export const updateTrip = (data: TripForm) => {
  return request({
    url: '/demo/trip',
    method: 'put',
    data: data
  });
};

/**
 * 删除运输行程
 * @param tripId
 */
export const delTrip = (tripId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/trip/' + tripId,
    method: 'delete'
  });
};

/**
 * 根据 Shipment Order ID 查询运输行程列表
 * @param shipmentId
 * @returns {*}
 */
export const getTripByShipmentOrder = (shipmentId: string | number): AxiosPromise<TripVO[]> => {
  return request({
    url: `/demo/trip/shipmentOrder/${shipmentId}`,
    method: 'get'
  });
};
