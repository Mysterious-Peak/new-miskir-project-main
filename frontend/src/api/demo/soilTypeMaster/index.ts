import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SoilTypeMasterVO, SoilTypeMasterForm, SoilTypeMasterQuery } from '@/api/demo/soilTypeMaster/types';

/**
 * 查询土壤类型主数据列表
 * @param query
 * @returns {*}
 */

export const listSoilTypeMaster = (query?: SoilTypeMasterQuery): AxiosPromise<SoilTypeMasterVO[]> => {
  return request({
    url: '/demo/soilTypeMaster/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询土壤类型主数据详细
 * @param id
 */
export const getSoilTypeMaster = (id: string | number): AxiosPromise<SoilTypeMasterVO> => {
  return request({
    url: '/demo/soilTypeMaster/' + id,
    method: 'get'
  });
};

/**
 * 新增土壤类型主数据
 * @param data
 */
export const addSoilTypeMaster = (data: SoilTypeMasterForm) => {
  return request({
    url: '/demo/soilTypeMaster',
    method: 'post',
    data: data
  });
};

/**
 * 修改土壤类型主数据
 * @param data
 */
export const updateSoilTypeMaster = (data: SoilTypeMasterForm) => {
  return request({
    url: '/demo/soilTypeMaster',
    method: 'put',
    data: data
  });
};

/**
 * 删除土壤类型主数据
 * @param id
 */
export const delSoilTypeMaster = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/soilTypeMaster/' + id,
    method: 'delete'
  });
};
