import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { VehicleVO, VehicleForm, VehicleQuery } from '@/api/demo/vehicle/types';

/**
 * 查询车辆主列表
 * @param query
 * @returns {*}
 */

export const listVehicle = (query?: VehicleQuery): AxiosPromise<VehicleVO[]> => {
  return request({
    url: '/demo/vehicle/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询车辆主详细
 * @param vehicleId
 */
export const getVehicle = (vehicleId: string | number): AxiosPromise<VehicleVO> => {
  return request({
    url: '/demo/vehicle/' + vehicleId,
    method: 'get'
  });
};

/**
 * 新增车辆主
 * @param data
 */
export const addVehicle = (data: VehicleForm) => {
  return request({
    url: '/demo/vehicle',
    method: 'post',
    data: data
  });
};

/**
 * 修改车辆主
 * @param data
 */
export const updateVehicle = (data: VehicleForm) => {
  return request({
    url: '/demo/vehicle',
    method: 'put',
    data: data
  });
};

/**
 * 删除车辆主
 * @param vehicleId
 */
export const delVehicle = (vehicleId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/vehicle/' + vehicleId,
    method: 'delete'
  });
};
