import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { IotEnvironmentLogVO, IotEnvironmentLogForm, IotEnvironmentLogQuery } from '@/api/demo/iotEnvironmentLog/types';

/**
 * 查询IoT环境日志列表
 * @param query
 * @returns {*}
 */

export const listIotEnvironmentLog = (query?: IotEnvironmentLogQuery): AxiosPromise<IotEnvironmentLogVO[]> => {
  return request({
    url: '/demo/iotEnvironmentLog/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询IoT环境日志详细
 * @param id
 */
export const getIotEnvironmentLog = (id: string | number): AxiosPromise<IotEnvironmentLogVO> => {
  return request({
    url: '/demo/iotEnvironmentLog/' + id,
    method: 'get'
  });
};

/**
 * 新增IoT环境日志
 * @param data
 */
export const addIotEnvironmentLog = (data: IotEnvironmentLogForm) => {
  return request({
    url: '/demo/iotEnvironmentLog',
    method: 'post',
    data: data
  });
};

/**
 * 修改IoT环境日志
 * @param data
 */
export const updateIotEnvironmentLog = (data: IotEnvironmentLogForm) => {
  return request({
    url: '/demo/iotEnvironmentLog',
    method: 'put',
    data: data
  });
};

/**
 * 删除IoT环境日志
 * @param id
 */
export const delIotEnvironmentLog = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/iotEnvironmentLog/' + id,
    method: 'delete'
  });
};
