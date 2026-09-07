import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IotSensorReadingVO, IotSensorReadingForm, IotSensorReadingQuery } from '@/api/demo/iotSensorReading/types';

/**
 * 查询物联网传感器读数列表
 * @param query
 * @returns {*}
 */

export const listIotSensorReading = (query?: IotSensorReadingQuery): AxiosPromise<IotSensorReadingVO[]> => {
  return request({
    url: '/demo/iotSensorReading/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询物联网传感器读数详细
 * @param sensorReadingId
 */
export const getIotSensorReading = (sensorReadingId: string | number): AxiosPromise<IotSensorReadingVO> => {
  return request({
    url: '/demo/iotSensorReading/' + sensorReadingId,
    method: 'get'
  });
};

/**
 * 新增物联网传感器读数
 * @param data
 */
export const addIotSensorReading = (data: IotSensorReadingForm) => {
  return request({
    url: '/demo/iotSensorReading',
    method: 'post',
    data: data
  });
};

/**
 * 修改物联网传感器读数
 * @param data
 */
export const updateIotSensorReading = (data: IotSensorReadingForm) => {
  return request({
    url: '/demo/iotSensorReading',
    method: 'put',
    data: data
  });
};

/**
 * 删除物联网传感器读数
 * @param sensorReadingId
 */
export const delIotSensorReading = (sensorReadingId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/iotSensorReading/' + sensorReadingId,
    method: 'delete'
  });
};
