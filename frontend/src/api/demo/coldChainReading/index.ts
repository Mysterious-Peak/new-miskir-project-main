import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ColdChainReadingVO, ColdChainReadingForm, ColdChainReadingQuery } from '@/api/demo/coldChainReading/types';

/**
 * 查询冷链温度读数列表
 * @param query
 * @returns {*}
 */

export const listColdChainReading = (query?: ColdChainReadingQuery): AxiosPromise<ColdChainReadingVO[]> => {
  return request({
    url: '/demo/coldChainReading/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询冷链温度读数详细
 * @param sensorId
 */
export const getColdChainReading = (sensorId: string | number): AxiosPromise<ColdChainReadingVO> => {
  return request({
    url: '/demo/coldChainReading/' + sensorId,
    method: 'get'
  });
};

/**
 * 新增冷链温度读数
 * @param data
 */
export const addColdChainReading = (data: ColdChainReadingForm) => {
  return request({
    url: '/demo/coldChainReading',
    method: 'post',
    data: data
  });
};

/**
 * 修改冷链温度读数
 * @param data
 */
export const updateColdChainReading = (data: ColdChainReadingForm) => {
  return request({
    url: '/demo/coldChainReading',
    method: 'put',
    data: data
  });
};

/**
 * 删除冷链温度读数
 * @param sensorId
 */
export const delColdChainReading = (sensorId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/coldChainReading/' + sensorId,
    method: 'delete'
  });
};
