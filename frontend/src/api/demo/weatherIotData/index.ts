import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WeatherIotDataVO, WeatherIotDataForm, WeatherIotDataQuery } from '@/api/demo/weatherIotData/types';

/**
 * 查询天气与IoT数据列表
 * @param query
 * @returns {*}
 */

export const listWeatherIotData = (query?: WeatherIotDataQuery): AxiosPromise<WeatherIotDataVO[]> => {
  return request({
    url: '/demo/weatherIotData/list',
    method: 'get',
    params: query
  });
};

export const listWeatherIotDataApprove = (query?: WeatherIotDataQuery): AxiosPromise<WeatherIotDataVO[]> => {
  return request({
    url: '/demo/weatherIotData/list/approved',
    method: 'get',
    params: query
  });
};

/**
 * 查询数据来源选项
 */
export const listWeatherIotDataSources = (): AxiosPromise<string[]> => {
  return request({
    url: '/demo/weatherIotData/dataSources',
    method: 'get'
  });
};

/**
 * 查询生产季节ID选项
 */
export const listWeatherIotProdSeasonIds = (): AxiosPromise<Array<string | number>> => {
  return request({
    url: '/demo/weatherIotData/prodSeasonIds',
    method: 'get'
  });
};

/**
 * 查询天气IoT趋势
 */
export const getWeatherIotTrend = (query?: Record<string, any>): AxiosPromise<any> => {
  return request({
    url: '/demo/weatherIotData/trend',
    method: 'get',
    params: query
  });
};

/**
 * 查询天气与IoT数据详细
 * @param weatherId
 */
export const getWeatherIotData = (weatherId: string | number): AxiosPromise<WeatherIotDataVO> => {
  return request({
    url: '/demo/weatherIotData/' + weatherId,
    method: 'get'
  });
};

/**
 * 新增天气与IoT数据
 * @param data
 */
export const addWeatherIotData = (data: WeatherIotDataForm) => {
  return request({
    url: '/demo/weatherIotData',
    method: 'post',
    data: data
  });
};

/**
 * 修改天气与IoT数据
 * @param data
 */
export const updateWeatherIotData = (data: WeatherIotDataForm) => {
  return request({
    url: '/demo/weatherIotData',
    method: 'put',
    data: data
  });
};

/**
 * 删除天气与IoT数据
 * @param weatherId
 */
export const delWeatherIotData = (weatherId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/weatherIotData/' + weatherId,
    method: 'delete'
  });
};
