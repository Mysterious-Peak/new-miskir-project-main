import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FarmerVO, FarmerForm, FarmerQuery } from '@/api/system/farmer/types';

/**
 * 查询Farmer Management列表
 * @param query
 * @returns {*}
 */

export const listFarmer = (query?: FarmerQuery): AxiosPromise<FarmerVO[]> => {
  return request({
    url: '/system/farmer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询Farmer Management详细
 * @param id
 */
export const getFarmer = (id: string | number): AxiosPromise<FarmerVO> => {
  return request({
    url: '/system/farmer/' + id,
    method: 'get'
  });
};

/**
 * 新增Farmer Management
 * @param data
 */
export const addFarmer = (data: FarmerForm) => {
  return request({
    url: '/system/farmer',
    method: 'post',
    data: data
  });
};

/**
 * 修改Farmer Management
 * @param data
 */
export const updateFarmer = (data: FarmerForm) => {
  return request({
    url: '/system/farmer',
    method: 'put',
    data: data
  });
};

/**
 * 删除Farmer Management
 * @param id
 */
export const delFarmer = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/farmer/' + id,
    method: 'delete'
  });
};
