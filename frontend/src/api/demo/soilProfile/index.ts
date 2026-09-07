import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SoilProfileVO, SoilProfileForm, SoilProfileQuery } from '@/api/demo/soilProfile/types';
import { serializeSoilProfileFormData } from '@/views/demo/soilProfile/constants';

/**
 * 查询土壤分析列表
 * @param query
 * @returns {*}
 */

export const listSoilProfile = (query?: SoilProfileQuery): AxiosPromise<SoilProfileVO[]> => {
  return request({
    url: '/demo/soilProfile/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询 Soil Profile 可选 Farmland ID 列表
 */
export const listSoilProfileFarmlandIds = (query?: Record<string, any>): AxiosPromise<any> => {
  return request({
    url: '/demo/soilProfile/farmlandIds',
    method: 'get',
    params: query
  });
};

/**
 * 查询土壤分析趋势
 */
export const getSoilProfileTrend = (query?: Record<string, any>): AxiosPromise<any> => {
  return request({
    url: '/demo/soilProfile/trend',
    method: 'get',
    params: query
  });
};

/**
 * 查询土壤分析详细
 * @param soilProfileId
 */
export const getSoilProfile = (soilProfileId: string | number): AxiosPromise<SoilProfileVO> => {
  return request({
    url: '/demo/soilProfile/' + soilProfileId,
    method: 'get'
  });
};

/**
 * 新增土壤分析
 * @param data
 */
export const addSoilProfile = (data: SoilProfileForm) => {
  return request({
    url: '/demo/soilProfile',
    method: 'post',
    data: serializeSoilProfileFormData(data)
  });
};

/**
 * 修改土壤分析
 * @param data
 */
export const updateSoilProfile = (data: SoilProfileForm) => {
  return request({
    url: '/demo/soilProfile',
    method: 'put',
    data: serializeSoilProfileFormData(data)
  });
};

/**
 * 删除土壤分析
 * @param soilProfileId
 */
export const delSoilProfile = (soilProfileId: string | number | Array<string | number>) => {
  return request({
    url: '/demo/soilProfile/' + soilProfileId,
    method: 'delete'
  });
};
