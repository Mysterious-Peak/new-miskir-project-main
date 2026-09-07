import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FarmlandVO, FarmlandForm, FarmlandQuery } from '@/api/demo/farmland/types';

/**
 * 查询农田信息列表
 * @param query
 * @returns {*}
 */

export const listFarmland = (query?: FarmlandQuery): AxiosPromise<FarmlandVO[]> => {
  return request({
    url: '/demo/farmland/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询农田信息详细
 * @param id
 */
export const getFarmland = (id: string | number): AxiosPromise<FarmlandVO> => {
  return request({
    url: '/demo/farmland/' + id,
    method: 'get'
  });
};

/**
 * 新增农田信息
 * @param data
 */
export const addFarmland = (data: FarmlandForm) => {
  return request({
    url: '/demo/farmland',
    method: 'post',
    data: data
  });
};

/**
 * 修改农田信息
 * @param data
 */
export const updateFarmland = (data: FarmlandForm) => {
  return request({
    url: '/demo/farmland',
    method: 'put',
    data: data
  });
};

/**
 * 删除农田信息
 * @param id
 */
export const delFarmland = (id: string | number | Array<string | number>) => {
  return request({
    url: '/demo/farmland/' + id,
    method: 'delete'
  });
};

/**
 * 获取Farmland ID列表
 * @param query 查询条件（FarmlandQuery）
 */
export const autoCompleteFarmlandId = (query?: FarmlandQuery): AxiosPromise<FarmlandVO[]> => {
  return request({
    url: '/demo/farmland/autoComplete/farmlandId',
    method: 'get',
    params: query
  });
};

/**
 * 获取Farmer ID列表
 * @param query 查询条件（FarmlandQuery）
 */
export const autoCompleteFarmerId = (query?: FarmlandQuery): AxiosPromise<FarmlandVO[]> => {
  return request({
    url: '/demo/farmland/autoComplete/farmerId',
    method: 'get',
    params: query
  });
};
