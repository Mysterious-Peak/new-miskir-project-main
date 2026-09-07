import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LogisticsProviderVO, LogisticsProviderForm, LogisticsProviderQuery } from '@/api/demo/logisticsProvider/types';

/**
 * 查询物流服务商主列表
 * @param query
 * @returns {*}
 */

export const listLogisticsProvider = (query?: LogisticsProviderQuery): AxiosPromise<LogisticsProviderVO[]> => {
  return request({
    url: '/demo/logisticsProvider/list',
    method: 'get',
    params: query
  });
};

/**
 * Provider ID 自动补全（仅已有记录）
 */
export const autoCompleteLogisticsProviderExistingProviderId = (query?: LogisticsProviderQuery): AxiosPromise<LogisticsProviderVO[]> => {
  return request({
    url: '/demo/logisticsProvider/autoComplete/providerId/existing',
    method: 'get',
    params: query
  });
};

/**
 * 查询物流服务商主详细
 * @param providerId
 */
export const getLogisticsProvider = (providerId: string | number): AxiosPromise<LogisticsProviderVO> => {
  return request({
    url: '/demo/logisticsProvider/' + providerId,
    method: 'get'
  });
};

/**
 * 新增物流服务商主
 * @param data
 */
export const addLogisticsProvider = (data: LogisticsProviderForm) => {
  return request({
    url: '/demo/logisticsProvider',
    method: 'post',
    data: data
  });
};

/**
 * 修改物流服务商主
 * @param data
 */
export const updateLogisticsProvider = (data: LogisticsProviderForm) => {
  return request({
    url: '/demo/logisticsProvider',
    method: 'put',
    data: data
  });
};

/**
 * 删除物流服务商主
 * @param providerId
 */
export const delLogisticsProvider = (providerId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/logisticsProvider/' + providerId,
    method: 'delete'
  });
};
